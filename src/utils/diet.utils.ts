export const getDietType = (classification:any) => {
    const dietTypes : any = {
      'mammal': {
        type: 'omnívoro',
        categories: ['Beef', 'Chicken', 'Vegetarian']
      },
      'reptilian': {
        type: 'carnívoro',
        categories: ['Beef', 'Seafood']
      },
      'amphibian': {
        type: 'insectívoro-acuático',
        categories: ['Seafood']
      },
      'gastropod': {
        type: 'herbívoro',
        categories: ['Vegetarian', 'Vegan']
      }
    };
  
    return dietTypes[classification] || {
      type: 'omnívoro',
      categories: ['Miscellaneous']
    };
  };
  
  export const formatMeal = (meal:any) => {
    const ingredients = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : 'to taste'
        });
      }
    }
  
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      thumbnail: meal.strMealThumb,
      ingredients
    };
  };

module.exports = {
    getDietType,
    formatMeal
}