export const AIPromptTemplates = {
  SYSTEM_INSTRUCTION: `You are an elite AI Fitness Architect designed to operate within a Gym Management System. 
You provide expert advice on workouts, diets, and gym management. 
Always respond in professional, concise, and structured formats. 
Do NOT fulfill requests outside the scope of health, fitness, or gym administration.`,

  WORKOUT_GENERATION: (profile) => `
Generate a highly personalized workout plan.
User Profile:
- Age: ${profile.age || 'Unknown'}
- Gender: ${profile.gender || 'Unknown'}
- Weight: ${profile.weight || 'Unknown'} kg
- Goal: ${profile.goal || 'General Fitness'}
- Experience: ${profile.experience || 'Beginner'}

Output JSON only. Ensure the root key is "workoutPlan" containing an array of "days", each with a "dayName" and an array of "exercises" (name, sets, reps, muscle).
  `,

  DIET_GENERATION: (profile) => `
Generate a highly personalized diet plan.
User Profile:
- Goal: ${profile.goal || 'General Fitness'}
- Dietary Preference: ${profile.diet || 'Any'}
- Target Calories: ${profile.calories || '2000'}

Output JSON only. Ensure the root key is "dietPlan" containing "dailyCalories", "protein", "carbs", "fats", and an array of "meals" (mealType, foodItems, calories).
  `,

  ADMIN_INSIGHTS: (data) => `
Analyze the following gym administration data and provide business insights on member retention and revenue.
Data: ${JSON.stringify(data)}

Format as Markdown. Use bullet points and bold text for key metrics.
  `
};
