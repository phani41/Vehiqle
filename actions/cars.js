"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase";
import { db } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {v4 as uuidv4} from "uuid";
import { serializedCarData } from "@/lib/helper";
import { createAdminClient } from "@/lib/supabase";

async function fileToBase64(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");

}
export async function processCarImageWithAI(file) {
    if (!file) {
        return {
            success: false,
            error: "No file provided",
            data: {
                make: "",
                model: "",
                year: 0,
                color: "",
                price: "",
                bodyType: "",
                mileage: "",
                fuelType: "",
                transmission: "",
                description: "",
                conidence: 0.0,
            },
        };
    }

    // Safe wrapper around Gemini AI - do not let failures crash the app
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not configured; skipping AI analysis");
            return {
                success: false,
                error: "GEMINI_API_KEY not configured",
                data: {
                    make: "",
                    model: "",
                    year: 0,
                    color: "",
                    price: "",
                    bodyType: "",
                    mileage: "",
                    fuelType: "",
                    transmission: "",
                    description: "",
                    conidence: 0.0,
                },
            };
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const base64Image = await fileToBase64(file);

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: file.type,
            },
        };

        const prompt = `
                        Analyze this car image and extract the following information:
                        1. Make (manufacturer)
                        2. Model
                        3. Year (approximately)
                        4. Color
                        5. Body type (SUV, sedan, Hatchback, etc.)
                        6. Mileage
                        7. Fuel type (your best guess)
                        8. Transmission type (your best guess)
                        9. price (your best guess)
                        10. Short Description as to be added to car listing
             
                        Format your response as a clean JSON object with these fields:
                        {
                                "make": "",
                                "model": "",
                                "year": 0000,
                                "color": "",
                                "price": "",
                                "bodyType": "",
                                "mileage": "",
                                "fuelType": "",
                                "transmission": "",
                                "description": "",
                                "conidence": 0.0
                        }
                             For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
                             Only respond with the JSON objects,nothing else.

                        `;

        const result = await model.generateContent([imagePart, prompt]);

        // Guard against different SDK response shapes
        let text = "";
        if (result?.response) {
            const resp = result.response;
            text = typeof resp.text === "function" ? await resp.text() : String(resp);
        } else if (typeof result.text === "function") {
            text = await result.text();
        } else {
            text = String(result);
        }

        const cleanedText = text.replace(/``(?:json)?\n?/g, "").trim();

        try {
            const carDetails = JSON.parse(cleanedText);

            const requiredFields = [
                "make",
                "model",
                "year",
                "color",
                "price",
                "bodyType",
                "mileage",
                "fuelType",
                "transmission",
                "description",
                "conidence",
            ];

            const missingFields = requiredFields.filter((field) => !(field in carDetails));

            if (missingFields.length > 0) {
                console.warn("AI response missing fields:", missingFields);
                return {
                    success: false,
                    error: `AI response missing fields: ${missingFields.join(",")}`,
                    data: carDetails,
                };
            }

            return {
                success: true,
                data: carDetails,
            };
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            return {
                success: false,
                error: "Failed to parse AI response",
                data: {
                    make: "",
                    model: "",
                    year: 0,
                    color: "",
                    price: "",
                    bodyType: "",
                    mileage: "",
                    fuelType: "",
                    transmission: "",
                    description: "",
                    conidence: 0.0,
                },
            };
        }
    } catch (error) {
        // Any Gemini/SDK error should be logged but not thrown
        console.error("Gemini AI error:", error);
        return {
            success: false,
            error: "Gemini AI error",
            data: {
                make: "",
                model: "",
                year: 0,
                color: "",
                price: "",
                bodyType: "",
                mileage: "",
                fuelType: "",
                transmission: "",
                description: "",
                conidence: 0.0,
            },
        };
    }
}

export async function addCar({carData, images}) {
    try {
       const { userId} = await auth();
       if (!userId) throw new Error ("Unauthorized");

       const user = await db.user.findUnique({
        where: { clerkUserId: userId},
       });

        if (!user) throw new Error("User not found");

        const carId = uuidv4();
        const folderPath =`cars/${carId}`;

       const supabase = createAdminClient();

        const imageUrls = [];

        for (let i=0;i<images.length;i++){
            const base64Data = images[i];

            if (!base64Data || !base64Data.startsWith("data:image/")){
                console.warn("Skipping invalid image data");
                continue;
            }
             
            const base64 = base64Data.split(",")[1];
            const imageBuffer = Buffer.from(base64,"base64");

            const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
            const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

            const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
            const filePath = `${folderPath}/${fileName}`;

             const {data, error} = await supabase.storage.from("cars-images").upload(filePath,imageBuffer,{
                contentType:`image/${fileExtension}`,
            });
             if (error) {
                 console.error("Error uploading image:", error);
                 throw new Error(`Failed to upload image:${error.message}`);
             }
             const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cars-images/${filePath}`;

             imageUrls.push(publicUrl);
        }
         if (imageUrls.length === 0){
            throw new Error("No valid images were uploaded");
         }
         const car = await db.car.create({
                data: {
                id: carId, // Use the same ID we used for the folder
                make: carData.make,
                model: carData.model,
                year: carData.year,
                price: Number(carData.price || 0),
                mileage: carData.mileage,
                color: carData.color,
                fuelType: carData.fuelType,
                transmission: carData.transmission,
                bodyType: carData.bodyType,
                seats: carData.seats,
                description: carData.description,
                status: carData.status,
                featured: carData.featured,
             image: imageUrls, // Store the array of image URLs (Prisma field `image`)
      },
    });

    revalidatePath('/admin/cars')
    return{
        success: true,
    };
    } catch (error) {
        throw new Error ("Error adding:"+ error.message);
        
    }
}

export async function getCars(search="") {
    try {
       const { userId} = await auth();
       if (!userId) throw new Error ("Unauthorized");

       const user = await db.user.findUnique({
        where: { clerkUserId: userId},
       });

        if (!user) throw new Error("User not found");
         
        let where = {};

        if(search){
            where.OR =[
            {make:{contains:search,mode:"insensitive"} },
            {model:{contains:search,mode:"insensitive"} },
            {color:{contains:search,mode:"insensitive"} },
           ];
        } 
        const cars = await db.car.findMany({
            where,
            orderBy:{createdAt:"desc"},
        });  
        const serializedcars = cars.map(serializedCarData);

        return {
            success: true,
            data: serializedcars,
        };
    } catch (error) {
        console.error("Error fetching cars:",error);
        return {
            success: false,
            error: error.message,
        };
    }
}

export async function deleteCar(id) {
    try{
       const { userId} = await auth();
       if (!userId) throw new Error ("Unauthorized");

       const user = await db.user.findUnique({
        where: { clerkUserId: userId},
       });

        if (!user) throw new Error("User not found");

        const car = await db.car.findUnique({
            where: {id},
            select: {image: true},

        });

        if (!car){
            return{
                success:false,
                error:"Car not found",
            };
        }

        await db.car.delete({
            where: {id},
        });

try {
            const cookieStore = await cookies();
            const supabase = createClient(cookieStore);

                        const filePaths = (car.image || []).map((imageUrl) => {
                                    try {
                                        const url = new URL(imageUrl);
                                        const pathMatch = url.pathname.match(/\/cars-images\/(.*)/);
                                        return pathMatch ? pathMatch[1] : null;
                                    } catch (e) {
                                        return null;
                                    }
                 }).filter(Boolean)

         if (filePaths.length > 0){
                        const { error} = await supabase.storage
                        .from("cars-images")
                        .remove(filePaths);

            if(error) {
                console.error("Error deleting images:",error);
            }
         }
            
        } catch (storageError) {
            console.error("Error with storage operations:",storageError);
        } 
          revalidatePath("/admin/cars");
           
          return {
            success: true,
          };
    } catch (error) {
        console.error("Error deleting car:",error);
        return{
            success: false,
            error: error.message,
        };
    }
}

export async function updateCarStatus(id,{ status, featured}) {
    try {
       const { userId} = await auth();
       if (!userId) throw new Error ("Unauthorized");

       const user = await db.user.findUnique({
        where: { clerkUserId: userId},
       });

        if (!user) throw new Error("User not found");
         
        const updateData ={};
        if (status !== undefined) {
            updateData.status =status;
        }

        if (featured !== undefined){
            updateData.featured = featured;
        }

        await db.car.update({
            where:{id},
            data:updateData,
        });

        revalidatePath("/admin/cars");
           
          return {
            success: true,
          };
} catch (error) {
    console.error("Error updating car status:",error);
        return{
            success: false,
            error: error.message,
        };
}


}