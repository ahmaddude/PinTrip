import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        const connection=await mongoose.connect(process.env.MONGO_DB);
        console.log("MONGODB connected ");
    } catch (error) {
        console.error(`Error: ${error.message}`);
		process.exit(1);
    }
}