/**
 * AI Suite Controller — Intelligent Workout, Diet, Progress Prediction & Fitness Assistant engines.
 */

export const generateAIWorkout = async (req, res, next) => {
  try {
    const { targetMuscle, fitnessLevel, equipment } = req.body;

    const routines = {
      Chest: [
        { name: 'Barbell Incline Bench Press', sets: 4, reps: '8-10', target: 'Upper Chest' },
        { name: 'Flat Dumbbell Press', sets: 4, reps: '10-12', target: 'Mid Chest' },
        { name: 'Cable Chest Flyes', sets: 3, reps: '15', target: 'Inner Chest' }
      ],
      Legs: [
        { name: 'Barbell Back Squats', sets: 4, reps: '6-8', target: 'Quads & Glutes' },
        { name: 'Romanian Deadlifts', sets: 4, reps: '10', target: 'Hamstrings' },
        { name: 'Leg Extensions', sets: 3, reps: '15', target: 'Quads' }
      ],
      Back: [
        { name: 'Lat Pulldowns', sets: 4, reps: '10-12', target: 'Lats' },
        { name: 'Seated Cable Rows', sets: 4, reps: '10', target: 'Mid Back' },
        { name: 'Single-Arm DB Row', sets: 3, reps: '12', target: 'Lats' }
      ]
    };

    const exercises = routines[targetMuscle] || [
      { name: 'Push-ups', sets: 4, reps: '20', target: 'Full Upper Body' },
      { name: 'Bodyweight Squats', sets: 4, reps: '25', target: 'Legs' },
      { name: 'Plank Hold', sets: 3, reps: '60s', target: 'Core' }
    ];

    res.status(200).json({
      success: true,
      message: `AI generated ${fitnessLevel || 'Intermediate'} ${targetMuscle || 'Full Body'} routine`,
      data: {
        title: `AI Custom ${targetMuscle || 'Full Body'} Hypertrophy`,
        targetMuscle: targetMuscle || 'Full Body',
        fitnessLevel: fitnessLevel || 'Intermediate',
        equipment: equipment || 'Gym Machines & Free Weights',
        exercises
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateAIDiet = async (req, res, next) => {
  try {
    const { calorieTarget, goal, dietType } = req.body;
    const targetCals = calorieTarget || 2200;

    res.status(200).json({
      success: true,
      message: `AI Diet Plan generated for ${goal || 'Weight Loss'}`,
      data: {
        title: `AI ${dietType || 'High Protein'} ${targetCals} kcal Plan`,
        dailyCalories: targetCals,
        macros: { protein: `${Math.round(targetCals * 0.35 / 4)}g`, carbs: `${Math.round(targetCals * 0.4 / 4)}g`, fats: `${Math.round(targetCals * 0.25 / 9)}g` },
        meals: [
          { meal: 'Breakfast', food: 'Oats, 4 Egg Whites, 1 Whey Scoop', calories: Math.round(targetCals * 0.25) },
          { meal: 'Lunch', food: '200g Grilled Chicken Breast / Paneer, Brown Rice, Vegetables', calories: Math.round(targetCals * 0.35) },
          { meal: 'Snack', food: 'Almonds, Apple, Green Tea', calories: Math.round(targetCals * 0.15) },
          { meal: 'Dinner', food: 'Grilled Fish / Tofu, Sweet Potato, Mixed Salad', calories: Math.round(targetCals * 0.25) }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const predictProgress = async (req, res, next) => {
  try {
    const { currentWeight, targetWeight, sessionsPerWeek } = req.body;
    const startW = parseFloat(currentWeight) || 80;
    const endW = parseFloat(targetWeight) || 72;
    const diff = startW - endW;
    const weeksNeeded = Math.ceil(Math.abs(diff) / 0.75); // ~0.75kg safe loss per week

    res.status(200).json({
      success: true,
      data: {
        currentWeight: startW,
        targetWeight: endW,
        estimatedWeeks: weeksNeeded,
        projectedCompletionDate: new Date(Date.now() + weeksNeeded * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        milestones: [
          { week: 4, projectedWeight: (startW - (diff * 0.33)).toFixed(1) },
          { week: 8, projectedWeight: (startW - (diff * 0.66)).toFixed(1) },
          { week: weeksNeeded, projectedWeight: endW.toFixed(1) }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const aiChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const query = (message || '').toLowerCase();
    let reply = "I'm your AI Fitness Assistant! You can ask me about workout splits, diet targets, gym timings, or membership plans.";

    if (query.includes('protein') || query.includes('diet')) {
      reply = "For optimal muscle building, aim for 1.6 to 2.2 grams of protein per kilogram of body weight daily. Combine lean meats, eggs, paneer, and whey protein!";
    } else if (query.includes('workout') || query.includes('exercise')) {
      reply = "A Push/Pull/Legs 3-day or 6-day split is ideal for hypertrophy! Ensure you train each muscle group twice a week with progressive overload.";
    } else if (query.includes('timing') || query.includes('hours') || query.includes('open')) {
      reply = "A² ReVamp Gym is open Monday to Saturday from 6:00 AM - 10:30 AM (Morning) and 5:00 PM - 9:30 PM (Evening). Sunday is closed.";
    } else if (query.includes('price') || query.includes('cost') || query.includes('membership')) {
      reply = "Our membership plans start at ₹999/month. Our Quarterly Plan (₹2,499) and Yearly Plan (₹7,999) include full swimming pool & sauna access!";
    }

    res.status(200).json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};
