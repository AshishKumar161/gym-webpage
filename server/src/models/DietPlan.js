import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Snack', 'Dinner'], required: true },
  foodItems: { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 }
});

const dietPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dailyCaloriesTarget: { type: Number, required: true },
    meals: [mealSchema],
    waterIntakeLiters: { type: Number, default: 3 },
    instructions: { type: String, default: '' }
  },
  { timestamps: true }
);

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;
