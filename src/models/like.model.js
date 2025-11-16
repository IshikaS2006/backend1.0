import { Mongoose, Schema } from "mongoose";

const LikeSchema = new Schema(
    {
        LikedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: 'Tweet',
            },
    },
    { timestamps: true }
);

export const Like = Mongoose.model('Like', LikeSchema);