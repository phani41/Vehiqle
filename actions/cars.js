"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase";
import { db } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {v4 as uuidv4} from "uuid";
import { serializedCarData } from "@/lib/helper";

async function fileToBase64(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");

}
export async function processCarImageWithAI(file){
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }
         const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
         const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

         const base64Image = await fileToBase64(file);

         const imagePart = {
            inlineData:{
                  data: base64Image,
            mimeType: file.type,
            },
         
    } ;
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
            const response = await result.response;
            const text = response.text();
            const cleanedText = text.replace(/``(?:json)?\n?/g, "").trim();
             
            try{
                const carDetails = JSON.parse(cleanedText);

                const requiredFields =[
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

                const missingFields = requiredFields.filter(
                    (field) => !(field in carDetails)
                );

                if (missingFields.length > 0){
                    throw new Error(
                        `AI response missing required fields:${missingFields.join(",")}`
                    );
                }
                 
                return {
                    success: true,
                    data: carDetails,
                };
            } catch (error){
                console.error("Failed to parse AI response:",parseError);
                return {
                    success: false,
                    error: "Failed to parse AI response",
                };
            }
} catch (error) {
  
    throw new Error("Gemini API error:" + error.message);
        
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

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

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

            const fileName = `image-${Data.now()}-${i}.${fileExtension}`;
            const filePath = `${folderPath}/${fileName}`;

             const {data, error} = await supabase.storage.from("cars-images").upload(filePath,imageBuffer,{
                contentType:`image/${fileExtension}`,
            });
             if (error) {
                 console.error("Error uploading image:", error);
                 throw new Error(`Failed to upload image:${error.message}`);
             }
               
             const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/
             public/cars-images/${filePath}`;

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
                price: carData.price,
                mileage: carData.mileage,
                color: carData.color,
                fuelType: carData.fuelType,
                transmission: carData.transmission,
                bodyType: carData.bodyType,
                seats: carData.seats,
                description: carData.description,
                status: carData.status,
                featured: carData.featured,
                images: imageUrls, // Store the array of image URLs
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
            select: {images: true},

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

            const filePaths = car.images.map((imageUrl)=>{
                  const url = new URL(imageUrl);
                  const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
                  return pathMatch ? pathMatch[1] : null;
         }).filter(Boolean)

         if (filePaths.length > 0){
            const { error} = await supabase.storage
            .from("car-images")
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