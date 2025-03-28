document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("display-recipes");
  const searchInput = document.getElementById("search-input");
  const dietSelect = document.getElementById("diet-select");
  const searchButton = document.getElementById("search-button");

  if (!resultsDiv || !searchInput || !dietSelect || !searchButton) {
    console.error("Required DOM elements not found");
    return;
  }
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('save-button')) {
      saveFavorite(e.target.dataset.id);
    }
    if (e.target.classList.contains('remove-button')) {
      removeFavorite(e.target.dataset.id);
    }
  });

  fetchRecipes();
  searchButton.addEventListener("click", handleSearch);
  searchInput.addEventListener("input", (e) => {
    console.log("Search input value:", e.target.value);
  });
  displayFavorites();

  function fetchRecipes(query = "", diet = "") {
    resultsDiv.innerHTML = "<p>Loading recipes...</p>";
    fetch(`http://localhost:3000/products?query=${query}&diet=${diet}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(recipes => {
        resultsDiv.innerHTML = "";
        if (recipes.length === 0) {
          resultsDiv.innerHTML = "<p>No recipes found. Try a different search.</p>";
          return;
        }
        recipes.forEach(renderRecipe);
      })
      .catch(error => {
        console.error("Error fetching recipes:", error);
        resultsDiv.innerHTML = "<p>Error loading recipes. Please try again later.</p>";
      });
  }

  function renderRecipe(recipe) {
    if (!recipe || !recipe.image || !recipe.label || !recipe.calories) {
      console.log("complete recipe data:", recipe); 
      return;
    }
    
    const recipeCard = document.createElement("div");
    recipeCard.className = "recipe-card";
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.label}" />
      <h3>${recipe.label}</h3>
      <p>Calories: ${Math.round(recipe.calories)}</p>
      <p>Diet: ${recipe.dietLabels?.join(", ") || "N/A"}</p>
      <button class="save-button" data-id="${recipe.id}">Save</button>
      <a href="${recipe.url}" target="_blank">View Recipe</a>
    `;
    resultsDiv.appendChild(recipeCard);
  }

  function handleSearch() {
    const query = searchInput.value.trim();
    const diet = dietSelect.value;
    fetchRecipes(query, diet);
  }

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return [];
    }
  }
  
  function saveFavorite(recipeId) {
    const favorites = getFavorites();
    if (!favorites.includes(recipeId)) {
      favorites.push(recipeId);
      try {
        localStorage.setItem("favorites", JSON.stringify(favorites));
        displayFavorites();
        alert("Recipe saved to favorites!");
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        alert("Failed to save favorite. Please try again.");
      }
    } else {
      alert("Recipe is already in favorites!");
    }
  }

  function displayFavorites() {
    const favoritesDiv = document.getElementById("favorites");
    if (!favoritesDiv) return;
    
    const favorites = getFavorites();
    favoritesDiv.innerHTML = "<p>Loading favorites...</p>";
    
    if (favorites.length === 0) {
      favoritesDiv.innerHTML += "<p>No favorites saved yet.</p>";
      return;
    }

    favorites.forEach(recipeId => {
      fetch(`http://localhost:3000/products/${recipeId}`)
        .then(response => {
          if (!response.ok) throw new Error("Recipe not found");
          return response.json();
        })
        .then(recipe => {
          if (!recipe) return;
          
          const recipeCard = document.createElement("div");
          recipeCard.className = "recipe-card";
          recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.label}" />
            <h3>${recipe.label}</h3>
            <p>Calories: ${Math.round(recipe.calories)}</p>
            <button class="remove-button" data-id="${recipe.id}">Remove</button>
            <a href="${recipe.url}" target="_blank">View Recipe</a>
          `;
          favoritesDiv.appendChild(recipeCard);
        })
        .catch(error => {
          console.error("Error fetching favorite recipe:", error);
          removeFavorite(recipeId);
        });
    });
  }

  function removeFavorite(recipeId) {
    const favorites = getFavorites();
    const newFavorites = favorites.filter(id => id !== recipeId);
    try {
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      displayFavorites();
      alert("Recipe removed from favorites!");
    } catch (error) {
      console.error("Error updating localStorage:", error);
      alert("Failed to remove favorite. Please try again.");
    }
  }
});