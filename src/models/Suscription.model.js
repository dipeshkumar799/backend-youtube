import { mongoose, Schema } from "mongoose";

const suscriptionSchema = new Schema(
    {
        suscriber: {
            type: Schema.Types.ObjectId, //one who is suscrbing
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId, //one to whom suscriber is suscribing
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export const Suscription = mongoose.model("Suscription", suscriptionSchema);
