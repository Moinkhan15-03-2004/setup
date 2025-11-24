import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; 

const videoSchema = new Schema({
    videoFile: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        
    },
    description: {
        type: String,
        required: true,
        
    },
    duration: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
    },
    views: {
        type: Number,
        required: true,
        default:0,
        
    },
    isPublished:{
        type: Boolean,
        
        default: true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        

    },


    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

})

videoSchema.plugin(mongooseAggregatePaginate)

export default mongoose.model("Video",videoSchema)