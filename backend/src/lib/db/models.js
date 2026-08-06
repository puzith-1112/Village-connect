import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["villager", "provider", "admin"], default: "villager" },
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    skills: [String],
    interests: [String],
    experience: String,
    employmentStatus: { type: String, enum: ["unemployed", "employed"], default: "unemployed" },
    currentJobId: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});
userSchema.methods.comparePassword = async function(password) {
  return bcryptjs.compare(password, this.password);
};
const User = mongoose.model("User", userSchema);
const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    location: String,
    salary: String,
    skillsRequired: { type: [String], default: [] },
    duration: String,
    jobType: String,
    postedBy: mongoose.Schema.Types.ObjectId,
    appliedBy: [mongoose.Schema.Types.ObjectId],
    status: { type: String, enum: ["open", "filled"], default: "open" },
    applications: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        skills: { type: [String], default: [] },
        interests: { type: [String], default: [] },
        experience: String,
        status: {
          type: String,
          enum: ["pending", "selected", "rejected"],
          default: "pending"
        },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    assignedCandidate: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);
const Job = mongoose.model("Job", jobSchema);
const agricultureSchema = new mongoose.Schema(
  {
    tips: { type: String, required: true },
    schemes: { type: String, required: true },
    title: String,
    category: { type: String, enum: ["tip", "scheme", "news"] },
    content: String,
    imageUrl: String
  },
  { timestamps: true }
);
const Agriculture = mongoose.model("Agriculture", agricultureSchema);
const healthcareSchema = new mongoose.Schema(
  {
    information: { type: String, required: true },
    services: { type: String, required: true },
    title: String,
    category: { type: String, enum: ["information", "service", "scheme"] },
    content: String,
    contactInfo: String,
    imageUrl: String
  },
  { timestamps: true }
);
const Healthcare = mongoose.model("Healthcare", healthcareSchema);
const educationSchema = new mongoose.Schema(
  {
    resources: { type: String, required: true },
    courses: { type: String, required: true },
    title: String,
    category: { type: String, enum: ["course", "resource", "scholarship"] },
    content: String,
    link: String,
    imageUrl: String
  },
  { timestamps: true }
);
const Education = mongoose.model("Education", educationSchema);
const grievanceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    status: { type: String, enum: ["pending", "in_progress", "resolved"], default: "pending" },
    userId: mongoose.Schema.Types.ObjectId,
    adminResponse: String
  },
  { timestamps: true }
);
const Grievance = mongoose.model("Grievance", grievanceSchema);
const environmentalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: String, enum: ["soil", "water", "air", "climate", "renewable", "waste", "biodiversity"], required: true },
    content: String,
    imageUrl: String,
    resources: [String],
    providerId: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);
const Environmental = mongoose.model("Environmental", environmentalSchema);
export {
  Agriculture,
  Education,
  Environmental,
  Grievance,
  Healthcare,
  Job,
  User
};
