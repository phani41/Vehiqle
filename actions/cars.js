"use server";
import { generateWithOllama } from "@/lib/ollama";
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
                confidence: 0.0,
            },
        };
    }

    // Safe wrapper around Local Ollama AI - runs offline without internet or API keys
    try {
        const base64Image = await fileToBase64(file);

        const prompt = `
Analyze this car image and extract the following information:
1. Make (manufacturer)
2. Model
3. Year (approximately, integer)
4. Color
5. Body type (SUV, Sedan, Hatchback, Coupe, etc.)
6. Mileage (estimated integer or text)
7. Fuel type (Petrol, Diesel, Electric, Hybrid)
8. Transmission type (Automatic or Manual)
9. Price (estimated number string)
10. Short Description as to be added to car listing

Format your response strictly as a JSON object with these exact keys:
{
  "make": "",
  "model": "",
  "year": 2020,
  "color": "",
  "price": "25000",
  "bodyType": "",
  "mileage": "35000",
  "fuelType": "",
  "transmission": "",
  "description": "",
  "confidence": 0.95
}
Only return the JSON object, nothing else.`;

        const result = await generateWithOllama({
            prompt,
            imageBase64: base64Image,
            format: "json",
        });

        if (!result.success) {
            return {
                success: false,
                error: result.error,
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
                    confidence: 0.0,
                },
            };
        }

        const cleanedText = result.text.replace(/```(?:json)?\n?/g, "").trim();

        try {
            const carDetails = JSON.parse(cleanedText);

            if (carDetails.conidence !== undefined && carDetails.confidence === undefined) {
                carDetails.confidence = carDetails.conidence;
            }

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
                "confidence",
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
        } catch (parseError) {
            console.error("Failed to parse Ollama AI response:", parseError);
            return {
                success: false,
                error: "Failed to parse Ollama AI response",
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
                    confidence: 0.0,
                },
            };
        }
    } catch (error) {
        console.error("Ollama AI processing error:", error);
        return {
            success: false,
            error: "Ollama AI error: " + error.message,
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
                confidence: 0.0,
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

        if (!user || user.role !== "ADMIN") {
            throw new Error("Unauthorized: Admin access required");
        }

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

    revalidatePath('/admin/cars');
    revalidatePath('/cars');
    revalidatePath('/');
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

        if (!user || user.role !== "ADMIN") {
            throw new Error("Unauthorized: Admin access required");
        }
         
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

        if (!user || user.role !== "ADMIN") {
            throw new Error("Unauthorized: Admin access required");
        }

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

        // Delete associated test drive bookings first to prevent foreign key violation
        await db.testDrivesBooking.deleteMany({
            where: { carId: id },
        });

        await db.car.delete({
            where: {id},
        });

        try {
            const supabase = createAdminClient();

            const filePaths = (car.image || []).map((imageUrl) => {
                try {
                    const url = new URL(imageUrl);
                    const pathMatch = url.pathname.match(/\/cars-images\/(.*)/);
                    return pathMatch ? pathMatch[1] : null;
                } catch (e) {
                    return null;
                }
            }).filter(Boolean);

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
          revalidatePath("/cars");
          revalidatePath("/");
           
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

        if (!user || user.role !== "ADMIN") {
            throw new Error("Unauthorized: Admin access required");
        }
         
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
        revalidatePath("/cars");
        revalidatePath("/");
           
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