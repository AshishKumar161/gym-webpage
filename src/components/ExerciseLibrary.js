/**
 * ExerciseLibrary Component — Exercise database categorized by muscle group with video previews.
 */
import { qsa } from '../utils/dom.js';

export const EXERCISES_DATABASE = [
  { id: 1, name: 'Barbell Bench Press', muscle: 'chest', level: 'Intermediate', equipment: 'Barbell', img: '/src/images/gm5.webp' },
  { id: 2, name: 'Incline Dumbbell Press', muscle: 'chest', level: 'Intermediate', equipment: 'Dumbbells', img: '/src/images/gm2.webp' },
  { id: 3, name: 'Barbell Back Squats', muscle: 'legs', level: 'Advanced', equipment: 'Barbell & Squat Rack', img: '/src/images/gm3.webp' },
  { id: 4, name: 'Romanian Deadlift', muscle: 'legs', level: 'Intermediate', equipment: 'Barbell', img: '/src/images/gm4.webp' },
  { id: 5, name: 'Lat Pulldowns', muscle: 'back', level: 'Beginner', equipment: 'Cable Machine', img: '/src/images/gm6.webp' },
  { id: 6, name: 'Seated Cable Row', muscle: 'back', level: 'Beginner', equipment: 'Cable Machine', img: '/src/images/gm8.webp' },
  { id: 7, name: 'Overhead DB Press', muscle: 'shoulders', level: 'Intermediate', equipment: 'Dumbbells', img: '/src/images/gm9.webp' },
  { id: 8, name: 'Lateral Raises', muscle: 'shoulders', level: 'Beginner', equipment: 'Dumbbells', img: '/src/images/gm10.webp' },
  { id: 9, name: 'Barbell Biceps Curls', muscle: 'arms', level: 'Beginner', equipment: 'Barbell', img: '/src/images/gm2.webp' },
  { id: 10, name: 'Triceps Cable Pushdowns', muscle: 'arms', level: 'Beginner', equipment: 'Cable Machine', img: '/src/images/gm4.webp' },
  { id: 11, name: 'Hanging Leg Raises', muscle: 'core', level: 'Intermediate', equipment: 'Pull-up Bar', img: '/src/images/gm5.webp' },
  { id: 12, name: 'Ab Wheel Rollouts', muscle: 'core', level: 'Advanced', equipment: 'Ab Wheel', img: '/src/images/gm6.webp' }
];

export function initExerciseLibrary() {
  const container = document.getElementById('exercise-grid');
  const filterBtns = qsa('.ex-filter-btn');

  if (!container) return;

  renderExercises('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const muscle = btn.getAttribute('data-muscle');
      renderExercises(muscle);
    });
  });

  function renderExercises(filter) {
    const list = filter === 'all' ? EXERCISES_DATABASE : EXERCISES_DATABASE.filter(e => e.muscle === filter);

    container.innerHTML = list
      .map(
        ex => `
      <div class="glass-card exercise-card fade-up" style="overflow:hidden; padding:0;">
        <div style="height:180px; overflow:hidden; position:relative;">
          <img src="${ex.img}" alt="${ex.name}" style="width:100%; height:100%; object-fit:cover;" />
          <span style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.7); color:#06b6d4; font-size:0.75rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:50px; text-transform:uppercase;">${ex.muscle}</span>
        </div>
        <div style="padding:1.2rem;">
          <h4 style="font-family:var(--font-display); font-size:1.05rem; font-weight:800; margin-bottom:0.4rem;">${ex.name}</h4>
          <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.8rem;">Level: ${ex.level} · Equipment: ${ex.equipment}</p>
          <button class="btn btn-outline" style="width:100%; padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="alert('Playing guide video for ${ex.name}...')">🎥 Watch Execution Guide</button>
        </div>
      </div>
    `
      )
      .join('');
  }
}
