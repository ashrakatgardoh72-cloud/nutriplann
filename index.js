"use strict";
(function () {
    const mysearchinput = document.getElementById('search-input');
    mysearchinput.addEventListener('input', function () {
        search(mysearchinput.value);
    });
    async function search(part) {
        let response = await fetch(`https://nutriplan-api.vercel.app/api/meals/search?q=${part}&page=1&limit=25`);
        let data = await response.json();
        resultt = data.results || [];
        display();
        const count = document.getElementById("recipes-count");
        if (count) {
            if (part.trim() !== "") {
                count.innerHTML = `Showing ${resultt.length} recipes for "${part}"`;
            }
            else {
                count.innerHTML = `Showing ${resultt.length} recipes`;
            }
        }
    }
    let resultt = [];
    let currentmeal = null;
    let currentnutrition = null;
    function showLoader() {
        document.getElementById('recipes-grid').innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-12 text-center"><span class="loader"></span></div>`;
    }
    async function getfood(category = "Chicken") {
        showLoader();
        await new Promise(function (resolve) {
            setTimeout(resolve, 200);
        });
        try {
            let response = await fetch(`https://nutriplan-api.vercel.app/api/meals/filter?category=${category}&page=1&limit=25`);
            let data = await response.json();
            resultt = data.results;
            display();
        }
        catch (erorr) {
            console.log(erorr);
            document.getElementById('recipes-grid').innerHTML = '';
        }
    }
    getfood();
    let islist = false;
    function display() {
        const grid = document.getElementById('recipes-grid');
        if (resultt.length === 0) {
            grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">No recipes found. Try a different search term.</p>
      </div>`;
            return;
        }
        if (islist) {
            grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-5';
        }
        else {
            grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5';
        }
        let cartona = '';
        for (let i = 0; i < resultt.length; i++) {
            const area = resultt[i].area ? resultt[i].area : 'international';
            cartona += `
    <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
         data-meal-id="${resultt[i].id}">

        <div class="relative overflow-hidden h-48">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
             src="${resultt[i].thumbnail}" alt="${resultt[i].name}" loading="lazy" />
      
        <div class="absolute bottom-3 left-3 flex gap-2">
          <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
            <i class="fa-solid fa-tag text-emerald-600 mr-1"></i>${resultt[i].category}
          </span>
          ${resultt[i].area ? `<span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${resultt[i].area}</span>` : ''}
        </div>
   </div>

  <div class="p-4 flex-1">
        <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
          ${resultt[i].name}
        </h3>
        <p class="text-xs text-gray-600 mb-3 line-clamp-2">
          ${resultt[i].instructions.join(' ')}
        </p>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-900">
            <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${resultt[i].category}
          </span>
          <span class="font-semibold text-gray-500">
            <i class="fa-solid fa-globe text-blue-500 mr-1"></i>${area}
          </span>
        </div>
      </div>
    </div>`;
        }
        grid.innerHTML = cartona;
        const moredetails = document.querySelectorAll('.recipe-card');
        console.log(moredetails.length);
        for (let i = 0; i < moredetails.length; i++) {
            moredetails[i].addEventListener('click', async function () {
                let mealid = moredetails[i].getAttribute('data-meal-id');
                let selectedmeal;
                for (let z = 0; z < resultt.length; z++) {
                    if (mealid === resultt[z].id) {
                        selectedmeal = resultt[z];
                    }
                }
                console.log(selectedmeal);
                const detail = document.getElementById('meal-details');
                detail?.classList.remove('hidden');
                const searchsection = document.getElementById('search-filters-section');
                const categoriessection = document.getElementById('meal-categories-section');
                const recipessection = document.getElementById('all-recipes-section');
                searchsection.classList.add('hidden');
                categoriessection.classList.add('hidden');
                recipessection.classList.add('hidden');
                document.getElementById('page-title').innerHTML = 'Recipe Details';
                document.getElementById('page-subtitle').innerHTML = 'View full recipe information and nutrition facts';
                window.scrollTo(0, 0);
                const title = document.getElementById('meal-name');
                title.innerHTML = selectedmeal.name;
                const myimg = document.getElementById('img-meal');
                myimg.src = selectedmeal.thumbnail;
                myimg.alt = selectedmeal.name;
                const meal_category = document.getElementById('meal-category');
                meal_category.innerHTML = selectedmeal.category;
                const meal_area = document.getElementById('meal-area');
                if (selectedmeal.area) {
                    meal_area.innerHTML = selectedmeal.area;
                    meal_area.classList.remove('hidden');
                }
                else {
                    meal_area.classList.add('hidden');
                }
                const meal_tag = document.getElementById('meal-tag');
                if (selectedmeal.tags[0]) {
                    meal_tag.innerHTML = selectedmeal.tags[0];
                    meal_tag.classList.remove('hidden');
                }
                else {
                    meal_tag.classList.add('hidden');
                }
                let box = '';
                for (let k = 0; k < selectedmeal.ingredients.length; k++) {
                    box += ` <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors" >
                <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
                <span class="text-gray-700">
                  <span class="font-medium text-gray-900"> ${selectedmeal.ingredients[k].measure}</span> 
                 ${selectedmeal.ingredients[k].ingredient}
                </span>
              </div>`;
                }
                const ingredientslist = document.getElementById('ingredients-list');
                ingredientslist.innerHTML = box;
                const count = document.getElementById('ingredients-count');
                count.innerHTML = selectedmeal.ingredients.length + ' items';
                let steps = '';
                for (let h = 0; h < selectedmeal.instructions.length; h++) {
                    steps += `        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div
                  class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                ${h + 1}
                </div>
                <p class="text-gray-700 leading-relaxed pt-2">
              ${selectedmeal.instructions[h]}
                </p>
              </div>`;
                }
                const insur_list = document.getElementById('instructions-list');
                insur_list.innerHTML = steps;
                const video = document.getElementById('meal-video');
                if (selectedmeal.youtube) {
                    video.src = selectedmeal.youtube.replace('watch?v=', 'embed/');
                }
                else {
                    video.src = 'https://www.youtube.com/embed/4aZr5hZXP_s';
                }
                let listmeal = [];
                for (let n = 0; n < selectedmeal.ingredients.length; n++) {
                    listmeal.push(selectedmeal.ingredients[n].measure + ' ' + selectedmeal.ingredients[n].ingredient);
                }
                console.log(listmeal);
                document.getElementById('nutrition-loading').classList.remove('hidden');
                document.getElementById('nutrition-facts-container').classList.add('hidden');
                document.getElementById('hero-calories').innerHTML = 'Calculating...';
                document.getElementById('log-meal-btn').classList.add('hidden');
                document.getElementById('log-meal-loading').classList.remove('hidden');
                const apikey = 'jntKWTqQQRNnNhFRMCt9tKgQJHPHDfFcgmzFHTKt';
                let response = await fetch('https://nutriplan-api.vercel.app/api/nutrition/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apikey
                    },
                    body: JSON.stringify({
                        recipeName: selectedmeal.name,
                        ingredients: listmeal
                    })
                });
                let data = await response.json();
                console.log(data);
                currentmeal = selectedmeal;
                currentnutrition = data.data.perServing;
                const herocalories = document.getElementById('hero-calories');
                const calperserving = document.getElementById('cal-per-serving');
                const caltotal = document.getElementById('cal-total');
                herocalories.innerHTML = data.data.perServing.calories + ' cal/serving';
                calperserving.innerHTML = data.data.perServing.calories;
                caltotal.innerHTML = 'Total: ' + data.data.totals.calories + ' cal';
                const proteinvalue = document.getElementById('protein-value');
                const carbsvalue = document.getElementById('carbs-value');
                const fatvalue = document.getElementById('fat-value');
                const fibervalue = document.getElementById('fiber-value');
                const sugarvalue = document.getElementById('sugar-value');
                const satfatvalue = document.getElementById('satfat-value');
                proteinvalue.innerHTML = data.data.perServing.protein + 'g';
                carbsvalue.innerHTML = data.data.perServing.carbs + 'g';
                fatvalue.innerHTML = data.data.perServing.fat + 'g';
                fibervalue.innerHTML = data.data.perServing.fiber + 'g';
                sugarvalue.innerHTML = data.data.perServing.sugar + 'g';
                satfatvalue.innerHTML = data.data.perServing.saturatedFat + 'g';
                const proteinbar = document.getElementById('protein-bar');
                const carbsbar = document.getElementById('carbs-bar');
                const fatbar = document.getElementById('fat-bar');
                const fiberbar = document.getElementById('fiber-bar');
                const sugarbar = document.getElementById('sugar-bar');
                const satfatbar = document.getElementById('satfat-bar');
                proteinbar.style.width = Math.min(data.data.perServing.protein / 50 * 100, 100) + '%';
                carbsbar.style.width = Math.min(data.data.perServing.carbs / 300 * 100, 100) + '%';
                fatbar.style.width = Math.min(data.data.perServing.fat / 65 * 100, 100) + '%';
                fiberbar.style.width = Math.min(data.data.perServing.fiber / 28 * 100, 100) + '%';
                sugarbar.style.width = Math.min(data.data.perServing.sugar / 50 * 100, 100) + '%';
                satfatbar.style.width = Math.min(data.data.perServing.saturatedFat / 20 * 100, 100) + '%';
                const cholesterolvalue = document.getElementById('cholesterol-value');
                const sodiumvalue = document.getElementById('sodium-value');
                cholesterolvalue.innerHTML = data.data.perServing.cholesterol + 'mg';
                sodiumvalue.innerHTML = data.data.perServing.sodium + 'mg';
                document.getElementById('nutrition-loading').classList.add('hidden');
                document.getElementById('nutrition-facts-container').classList.remove('hidden');
                document.getElementById('log-meal-btn').classList.remove('hidden');
                document.getElementById('log-meal-loading').classList.add('hidden');
                const logbtn = document.getElementById('log-meal-btn');
            });
        }
    }
    const cards = document.querySelectorAll('.category-card');
    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            const category = card.getAttribute('data-category');
            getfood(category);
            const count = document.getElementById("recipes-count");
            count.innerHTML = `Showing ${resultt.length} ${category} recipes`;
        });
    });
    const areas = [
        "All Cuisines",
        "Afghan",
        "Albanian",
        "Algerian",
        "Andorran",
        "Angolan",
        "Antiguan",
        "Argentine",
        "Armenian",
        "Aruban",
        "Australian"
    ];
    const myButtons = document.querySelectorAll('.overflow-x-auto.items-center button');
    async function getByArea(area) {
        showLoader();
        await new Promise(function (resolve) {
            setTimeout(resolve, 100);
        });
        try {
            let response = await fetch(`https://nutriplan-api.vercel.app/api/meals/filter?area=${area}&page=1&limit=25`);
            let data = await response.json();
            resultt = data.results || [];
            document.getElementById('recipes-count').innerHTML = `Showing ${resultt.length} ${area} recipes`;
            display();
        }
        catch (error) {
            console.log(error);
            document.getElementById('recipes-grid').innerHTML = '';
        }
    }
    for (let a = 0; a < myButtons.length; a++) {
        myButtons[a].addEventListener('click', function () {
            for (let b = 0; b < myButtons.length; b++) {
                myButtons[b].classList.remove('bg-emerald-600', 'text-white', 'hover:bg-emerald-700');
                myButtons[b].classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            }
            myButtons[a].classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            myButtons[a].classList.add('bg-emerald-600', 'text-white', 'hover:bg-emerald-700');
            if (a === 0) {
                getfood();
            }
            else {
                getByArea(areas[a]);
            }
        });
    }
    const btnstyle = document.getElementById('grid-view-btn');
    const btnstyle2 = document.getElementById('list-view-btn');
    btnstyle.addEventListener('click', function () {
        islist = false;
        btnstyle.classList.add('bg-white', 'rounded-md', 'shadow-sm');
        btnstyle2.classList.remove('bg-white', 'rounded-md', 'shadow-sm');
        display();
    });
    btnstyle2.addEventListener('click', function () {
        islist = true;
        btnstyle2.classList.add('bg-white', 'rounded-md', 'shadow-sm');
        btnstyle.classList.remove('bg-white', 'rounded-md', 'shadow-sm');
        display();
    });
    const backbtn = document.getElementById('back-to-meals-btn');
    backbtn.addEventListener('click', function () {
        document.getElementById('meal-details')?.classList.add('hidden');
        document.getElementById('search-filters-section')?.classList.remove('hidden');
        document.getElementById('meal-categories-section')?.classList.remove('hidden');
        document.getElementById('all-recipes-section')?.classList.remove('hidden');
        document.getElementById('page-title').innerHTML = 'Meals & Recipes';
        document.getElementById('page-subtitle').innerHTML = 'Discover delicious and nutritious recipes tailored for you';
        window.scrollTo(0, 0);
    });
    const logbtn = document.getElementById('log-meal-btn');
    logbtn?.addEventListener('click', function () {
        if (currentmeal && currentnutrition) {
            const modalimg = document.getElementById('modal-img');
            const modalname = document.getElementById('modal-name');
            const modalcal = document.getElementById('modal-cal');
            const modalprotein = document.getElementById('modal-protein');
            const modalcarbs = document.getElementById('modal-carbs');
            const modalfat = document.getElementById('modal-fat');
            const servingsinput = document.getElementById('servings-input');
            modalimg.src = currentmeal.thumbnail;
            modalimg.alt = currentmeal.name;
            modalname.innerHTML = currentmeal.name;
            modalcal.innerHTML = currentnutrition.calories + '';
            modalprotein.innerHTML = currentnutrition.protein + 'g';
            modalcarbs.innerHTML = currentnutrition.carbs + 'g';
            modalfat.innerHTML = currentnutrition.fat + 'g';
            servingsinput.value = '1';
            document.getElementById('log-modal').classList.remove('hidden');
        }
    });
    const plusbtn = document.getElementById('plus-btn');
    const minusbtn = document.getElementById('minus-btn');
    const servingsinput2 = document.getElementById('servings-input');
    plusbtn.addEventListener('click', function () {
        const current = Number(servingsinput2.value);
        if (current < 10) {
            servingsinput2.value = String(current + 0.5);
        }
    });
    minusbtn.addEventListener('click', function () {
        const current = Number(servingsinput2.value);
        if (current > 0.5) {
            servingsinput2.value = String(current - 0.5);
        }
    });
    const cancelbtn = document.getElementById('cancel-btn');
    cancelbtn.addEventListener('click', function () {
        document.getElementById('log-modal').classList.add('hidden');
    });
    const confirmlog = document.getElementById('confirm-log-btn');
    confirmlog.addEventListener('click', function () {
        if (currentmeal && currentnutrition) {
            let servings = Number(servingsinput2.value);
            let totalcal = Math.round(currentnutrition.calories * servings);
            let word = 'servings';
            if (servings === 1) {
                word = 'serving';
            }
            const key = 'foodlog-' + new Date().toLocaleDateString('en-CA');
            const saved = JSON.parse(localStorage.getItem(key) || '[]');
            saved.push({
                type: 'meal',
                name: currentmeal.name,
                thumbnail: currentmeal.thumbnail,
                brand: servings + ' ' + word,
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                calories: totalcal,
                protein: Math.round(currentnutrition.protein * servings * 10) / 10,
                carbs: Math.round(currentnutrition.carbs * servings * 10) / 10,
                fat: Math.round(currentnutrition.fat * servings * 10) / 10
            });
            localStorage.setItem(key, JSON.stringify(saved));
            window.dispatchEvent(new Event('foodlog-updated'));
            document.getElementById('log-modal').classList.add('hidden');
            Swal.fire({
                icon: 'success',
                title: 'Meal Logged!',
                html: `${currentmeal.name} (${servings} ${word}) has been added to your daily log.<br><span class="text-emerald-600 font-semibold">+${totalcal} calories</span>`,
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
})();
// page2
(function () {
    const searchinput = document.getElementById('product-search-input');
    const btnsearch = document.getElementById('search-product-btn');
    btnsearch.addEventListener('click', function () {
        getproudct(searchinput.value);
    });
    const productsgrid = document.getElementById('products-grid');
    productsgrid.addEventListener('click', function (e) {
        const card = e.target.closest('.product-card');
        if (card) {
            for (let i = 0; i < proudctts.length; i++) {
                if (proudctts[i].barcode === card.dataset.barcode) {
                    showproudct(proudctts[i]);
                }
            }
        }
    });
    function emptybox(inside) {
        return `
  <div class="flex flex-col items-center justify-center py-12 text-center" style="grid-column: 1 / -1">
    <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
      ${inside}
    </div>
    <p class="text-lg font-medium text-gray-500 mb-2">No products to display</p>
    <p class="text-sm text-gray-400">Search for a product or browse by category</p>
  </div>`;
    }
    productsgrid.innerHTML = emptybox('<i class="fa-solid fa-box-open text-gray-400 text-3xl"></i>');
    let proudctts = [];
    let currentproduct = null;
    async function getproudct(proudct, grade = '', category = '') {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = `<div class="flex items-center justify-center py-12" style="grid-column: 1 / -1"><span class="loader"></span></div>`;
        const icon = '<i class="fa-solid fa-box-open text-gray-400 text-3xl"></i>';
        const categoryname = category.replace(/_/g, ' ');
        try {
            let gradepart = '';
            let tagIndex = 0;
            if (grade) {
                gradepart = `&tagtype_0=nutrition_grades&tag_contains_0=contains&tag_0=${grade}`;
                tagIndex++;
            }
            if (category) {
                gradepart += `&tagtype_${tagIndex}=categories&tag_contains_${tagIndex}=contains&tag_${tagIndex}=${encodeURIComponent(category)}`;
            }
            let url = '';
            if (category) {
                url = `https://world.openfoodfacts.org/facets/categories/${category}.json?page=1&page_size=24`;
            }
            else {
                url = `https://world.openfoodfacts.org/cgi/search.pl?page=1&page_size=24&json=1&search_terms=${encodeURIComponent(proudct.trim())}${gradepart}`;
            }
            let response = await fetch(url);
            let data = await response.json();
            let list = data.products || [];
            proudctts = list.map(function (p) {
                return {
                    barcode: p.code,
                    name: p.product_name || 'Unknown product',
                    brand: p.brands || '',
                    image: p.image_front_small_url || p.image_url || '',
                    novaGroup: Number(p.nova_group ?? p.nova_groups ?? p.nutriments?.['nova-group'] ?? 0),
                    nutritionGrade: p.nutrition_grades || '',
                    quantity: p.quantity || '',
                    ingredients: p.ingredients_text || '',
                    allergens: (p.allergens_tags || []).map(function (a) { return a.replace('en:', ''); }).join(', '),
                    nutrients: {
                        calories: p.nutriments?.['energy-kcal_100g'] ?? 0,
                        protein: p.nutriments?.proteins_100g ?? 0,
                        carbs: p.nutriments?.carbohydrates_100g ?? 0,
                        fat: p.nutriments?.fat_100g ?? 0,
                        sugar: p.nutriments?.sugars_100g ?? 0,
                        saturatedFat: p.nutriments?.['saturated-fat_100g'] ?? 0,
                        fiber: p.nutriments?.fiber_100g ?? 0,
                        salt: p.nutriments?.salt_100g ?? 0
                    }
                };
            });
            if (proudctts.length === 0) {
                grid.innerHTML = emptybox(icon);
                if (category) {
                    document.getElementById('products-count').innerHTML = `No products found in ${categoryname}`;
                }
                else {
                    document.getElementById('products-count').innerHTML = `No products found for "${proudct}"`;
                }
            }
            else {
                document.getElementById('products-count').innerHTML = `Found ${data.count} products for "${proudct}"`;
                displayproudct();
            }
        }
        catch (error) {
            console.log(error);
            grid.innerHTML = emptybox(icon);
            if (category) {
                document.getElementById('products-count').innerHTML = `No products found in ${categoryname}`;
            }
        }
    }
    function fix1(value) {
        return (Number(value) || 0).toFixed(1);
    }
    function percent(value, max) {
        let result = (Number(value) || 0) / max * 100;
        if (result > 100) {
            result = 100;
        }
        return result;
    }
    function displayproudct() {
        let cartona = '';
        let gradeColors = {
            a: 'bg-green-500',
            b: 'bg-lime-500',
            c: 'bg-yellow-500',
            d: 'bg-orange-500',
            e: 'bg-red-500'
        };
        let novaColors = {
            1: 'bg-green-500',
            2: 'bg-lime-500',
            3: 'bg-orange-500',
            4: 'bg-red-500'
        };
        for (let i = 0; i < proudctts.length; i++) {
            let grade = proudctts[i].nutritionGrade;
            let color = 'bg-gray-400';
            if (gradeColors[grade]) {
                color = gradeColors[grade];
            }
            let nova = proudctts[i].novaGroup;
            let novacolor = 'bg-gray-400';
            if (novaColors[nova]) {
                novacolor = novaColors[nova];
            }
            cartona += ` <div
              class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              data-barcode="${proudctts[i].barcode}">
              <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  src="${proudctts[i].image}"
                  alt="${proudctts[i].name}" loading="lazy" />

                <!-- Nutri-Score Badge -->
                <div
                  class="absolute top-2 left-2 ${color} text-white text-xs font-bold px-2 py-1 rounded uppercase">
           Nutri-Score ${proudctts[i].nutritionGrade || 'unknown'}
                </div>

                <!-- NOVA Badge -->
           ${nova ? `<div class="absolute top-2 right-2 ${novacolor} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${nova}">${nova}</div>` : ''}
              </div>

              <div class="p-4">
                <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
                ${proudctts[i].brand}
                </p>
                <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                ${proudctts[i].name}
                </h3>

           <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
  <span><i class="fa-solid fa-weight-scale mr-1"></i>${proudctts[i].quantity}</span>
  <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(Number(proudctts[i].nutrients.calories) || 0)} kcal/100g</span>
</div>

                <!-- Mini Nutrition -->
                <div class="grid grid-cols-4 gap-1 text-center">
                  <div class="bg-emerald-50 rounded p-1.5">
                    <p class="text-xs font-bold text-emerald-700">${fix1(proudctts[i].nutrients.protein)}g</p>
                    <p class="text-[10px] text-gray-500">Protein</p>
                  </div>
                  <div class="bg-blue-50 rounded p-1.5">
                    <p class="text-xs font-bold text-blue-700">${fix1(proudctts[i].nutrients.carbs)}g</p>
                    <p class="text-[10px] text-gray-500">Carbs</p>
                  </div>
                  <div class="bg-purple-50 rounded p-1.5">
                    <p class="text-xs font-bold text-purple-700">${fix1(proudctts[i].nutrients.fat)}g</p>
                    <p class="text-[10px] text-gray-500">Fat</p>
                  </div>
                  <div class="bg-orange-50 rounded p-1.5">
                    <p class="text-xs font-bold text-orange-700">${fix1(proudctts[i].nutrients.sugar)}g</p>
                    <p class="text-[10px] text-gray-500">Sugar</p>
                  </div>
                </div>
              </div>
            </div>`;
        }
        document.getElementById('products-grid').innerHTML = cartona;
    }
    function showproudct(p) {
        document.getElementById('pm-name').textContent = p.name;
        document.getElementById('pm-brand').textContent = p.brand;
        document.getElementById('pm-quantity').textContent = p.quantity;
        document.getElementById('pm-cal').textContent = String(Math.round(p.nutrients.calories));
        document.getElementById('pm-protein').textContent = fix1(p.nutrients.protein) + 'g';
        document.getElementById('pm-carbs').textContent = fix1(p.nutrients.carbs) + 'g';
        document.getElementById('pm-fat').textContent = fix1(p.nutrients.fat) + 'g';
        document.getElementById('pm-sugar').textContent = fix1(p.nutrients.sugar) + 'g';
        document.getElementById('pm-satfat').textContent = fix1(p.nutrients.saturatedFat) + 'g';
        document.getElementById('pm-fiber').textContent = fix1(p.nutrients.fiber) + 'g';
        document.getElementById('pm-salt').textContent = p.nutrients.salt.toFixed(2) + 'g';
        const img = document.getElementById('pm-img');
        img.src = p.image;
        img.alt = p.name;
        document.getElementById('pm-ingredients').textContent = p.ingredients || 'No ingredients information available';
        const allergenbox = document.getElementById('pm-allergens-box');
        if (p.allergens) {
            document.getElementById('pm-allergens').textContent = p.allergens;
            allergenbox.classList.remove('hidden');
        }
        else {
            allergenbox.classList.add('hidden');
        }
        let nutriInfo = {
            a: { color: '#038141', label: 'Excellent' },
            b: { color: '#85bb2f', label: 'Good' },
            c: { color: '#fecb02', label: 'Average' },
            d: { color: '#ee8100', label: 'Poor' },
            e: { color: '#e63e11', label: 'Bad' }
        };
        let info = { color: '#9ca3af', label: 'Unknown' };
        if (nutriInfo[p.nutritionGrade]) {
            info = nutriInfo[p.nutritionGrade];
        }
        let letter = '?';
        if (p.nutritionGrade) {
            letter = p.nutritionGrade.toUpperCase();
        }
        const letterbox = document.getElementById('pm-nutri-letter');
        letterbox.textContent = letter;
        letterbox.style.backgroundColor = info.color;
        document.getElementById('pm-nutri-label').textContent = info.label;
        document.getElementById('pm-nutri-title').style.color = info.color;
        document.getElementById('pm-nutri-box').style.backgroundColor = info.color + '20';
        document.getElementById('pm-protein-bar').style.width = percent(p.nutrients.protein, 50) + '%';
        document.getElementById('pm-carbs-bar').style.width = percent(p.nutrients.carbs, 100) + '%';
        document.getElementById('pm-fat-bar').style.width = percent(p.nutrients.fat, 70) + '%';
        document.getElementById('pm-sugar-bar').style.width = percent(p.nutrients.sugar, 50) + '%';
        let novaInfo = {
            1: { color: '#038141', label: 'Unprocessed' },
            2: { color: '#85bb2f', label: 'Processed ingredients' },
            3: { color: '#ee8100', label: 'Processed' },
            4: { color: '#e63e11', label: 'Ultra-processed' }
        };
        const novabadge = document.getElementById('pm-nova-box');
        if (p.novaGroup) {
            let nova = novaInfo[p.novaGroup];
            const novabox = document.getElementById('pm-nova-num');
            novabox.textContent = String(p.novaGroup);
            novabox.style.backgroundColor = nova.color;
            document.getElementById('pm-nova-label').textContent = nova.label;
            document.getElementById('pm-nova-title').style.color = nova.color;
            novabadge.style.backgroundColor = nova.color + '20';
            novabadge.classList.remove('hidden');
        }
        else {
            novabadge.classList.add('hidden');
        }
        currentproduct = p;
        console.log(currentproduct);
        document.getElementById('product-modal').classList.remove('hidden');
    }
    function showtoast(name) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50';
        toast.textContent = name + ' logged to your daily intake! ';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-pen-to-square';
        toast.appendChild(icon);
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.remove();
        }, 2000);
    }
    document.getElementById('pm-log-btn').addEventListener('click', function () {
        if (!currentproduct)
            return;
        const key = 'foodlog-' + new Date().toLocaleDateString('en-CA');
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        saved.push({
            type: 'product',
            name: currentproduct.name,
            brand: currentproduct.brand,
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            calories: currentproduct.nutrients.calories,
            protein: currentproduct.nutrients.protein,
            carbs: currentproduct.nutrients.carbs,
            fat: currentproduct.nutrients.fat
        });
        localStorage.setItem(key, JSON.stringify(saved));
        window.dispatchEvent(new Event('foodlog-updated'));
        document.getElementById('product-modal').classList.add('hidden');
        showtoast(currentproduct.name);
    });
    const closebtns = document.querySelectorAll('.close-product-modal');
    for (let i = 0; i < closebtns.length; i++) {
        closebtns[i].addEventListener('click', function () {
            document.getElementById('product-modal').classList.add('hidden');
        });
    }
    const filtrbtn = document.querySelectorAll('.nutri-score-filter');
    for (let i = 0; i < filtrbtn.length; i++) {
        filtrbtn[i].addEventListener('click', function () {
            for (let j = 0; j < filtrbtn.length; j++) {
                filtrbtn[j].classList.remove('ring-2');
                filtrbtn[j].classList.remove('ring-gray-900');
            }
            filtrbtn[i].classList.add('ring-2');
            filtrbtn[i].classList.add('ring-gray-900');
            getproudct(searchinput.value, filtrbtn[i].dataset.grade);
        });
    }
    const categorybtns = document.querySelectorAll('.product-category-btn');
    for (let i = 0; i < categorybtns.length; i++) {
        categorybtns[i].addEventListener('click', function () {
            getproudct(searchinput.value, '', categorybtns[i].dataset.category);
        });
    }
    // barcode
    const barcodeinput = document.getElementById('barcode-input');
    const lookupbtn = document.getElementById('lookup-barcode-btn');
    lookupbtn.addEventListener('click', function () {
        const code = barcodeinput.value.trim();
        if (code)
            getbarcode(code);
    });
    async function getbarcode(code) {
        let response2 = await fetch(`https://nutriplan-api.vercel.app/api/products/barcode/${encodeURIComponent(code)}`);
        let data2 = await response2.json();
        const r = data2.result;
        if (!r) {
            proudctts = [];
            document.getElementById('products-count').innerHTML = `No product found for barcode "${code}"`;
            displayproudct();
            return;
        }
        let ingredients = '';
        let allergens = '';
        let saturatedFat = 0;
        try {
            const offres = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
            const offdata = await offres.json();
            const op = offdata.product;
            if (op) {
                ingredients = op.ingredients_text || '';
                allergens = (op.allergens_tags || []).map(function (a) { return a.replace('en:', ''); }).join(', ');
                saturatedFat = op.nutriments?.['saturated-fat_100g'] ?? 0;
            }
        }
        catch (error) {
            console.log(error);
        }
        proudctts = [{
                barcode: r.barcode,
                name: r.name || 'Unknown product',
                brand: r.brand || '',
                image: r.image || '',
                novaGroup: r.novaGroup ?? 0,
                nutritionGrade: r.nutritionGrade || '',
                quantity: '',
                ingredients: ingredients,
                allergens: allergens,
                nutrients: {
                    calories: r.nutrients?.calories ?? 0,
                    protein: r.nutrients?.protein ?? 0,
                    carbs: r.nutrients?.carbs ?? 0,
                    fat: r.nutrients?.fat ?? 0,
                    sugar: r.nutrients?.sugar ?? 0,
                    saturatedFat: saturatedFat,
                    fiber: r.nutrients?.fiber ?? 0,
                    salt: (r.nutrients?.sodium ?? 0) * 2.5
                }
            }];
        document.getElementById('products-count').innerHTML = `Found product: ${proudctts[0].name}`;
        displayproudct();
        showproudct(proudctts[0]);
    }
})();
// pages 
(function () {
    const navlinks = document.querySelectorAll('.nav-link');
    const pages = ['meals', 'products', 'foodlog'];
    function showpage(i) {
        for (let h = 0; h < navlinks.length; h++) {
            navlinks[h].classList.remove('bg-emerald-50');
            navlinks[h].classList.remove('text-emerald-700');
            navlinks[h].classList.add('text-gray-600');
        }
        document.getElementById('products-section').classList.add('hidden');
        document.getElementById('search-filters-section').classList.add('hidden');
        document.getElementById('meal-categories-section').classList.add('hidden');
        document.getElementById('all-recipes-section').classList.add('hidden');
        document.getElementById('meal-details').classList.add('hidden');
        document.getElementById('products-section').classList.add('hidden');
        document.getElementById('foodlog-section').classList.add('hidden');
        if (i === 0) {
            document.getElementById('search-filters-section').classList.remove('hidden');
            document.getElementById('meal-categories-section').classList.remove('hidden');
            document.getElementById('all-recipes-section').classList.remove('hidden');
            navlinks[i].classList.add('bg-emerald-50');
            navlinks[i].classList.add('text-emerald-700');
            navlinks[i].classList.remove('text-gray-600');
            document.getElementById('page-title').innerHTML = 'Meals & Recipes';
            document.getElementById('page-subtitle').innerHTML = 'Discover delicious and nutritious recipes tailored for you';
        }
        if (i === 1) {
            document.getElementById('products-section').classList.remove('hidden');
            navlinks[i].classList.add('bg-emerald-50');
            navlinks[i].classList.add('text-emerald-700');
            navlinks[i].classList.remove('text-gray-600');
            document.getElementById('page-title').innerHTML = 'Product Scanner';
            document.getElementById('page-subtitle').innerHTML = 'Search packaged foods by name or barcode';
        }
        if (i === 2) {
            document.getElementById('foodlog-section').classList.remove('hidden');
            navlinks[i].classList.add('bg-emerald-50');
            navlinks[i].classList.add('text-emerald-700');
            navlinks[i].classList.remove('text-gray-600');
            document.getElementById('page-title').innerHTML = 'Food Log';
            document.getElementById('page-subtitle').innerHTML = 'Track your daily nutrition and food intake';
        }
    }
    for (let i = 0; i < navlinks.length; i++) {
        navlinks[i].addEventListener('click', function (e) {
            e.preventDefault();
            if (location.hash === '#' + pages[i]) {
                showpage(i);
            }
            else {
                location.hash = pages[i];
            }
        });
    }
    window.addEventListener('hashchange', function () {
        let i = pages.indexOf(location.hash.slice(1));
        if (i === -1)
            i = 0;
        showpage(i);
    });
    let first = pages.indexOf(location.hash.slice(1));
    if (first === -1)
        first = 0;
    showpage(first);
})();
// page3
(function () {
    const goals = { calories: 2000, protein: 50, carbs: 250, fat: 65 };
    const foodlogdate = document.getElementById('foodlog-date');
    foodlogdate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const list = document.getElementById('logged-items-list');
    const todaySection = document.getElementById('foodlog-today-section');
    const clearBtn = document.getElementById('clear-foodlog');
    const cards = todaySection.querySelectorAll('.grid > div');
    const cardStyles = [
        { bar: 'bg-emerald-500', text: 'text-emerald-600', key: 'calories', unit: 'kcal' },
        { bar: 'bg-blue-500', text: 'text-blue-600', key: 'protein', unit: 'g' },
        { bar: 'bg-amber-500', text: 'text-amber-600', key: 'carbs', unit: 'g' },
        { bar: 'bg-purple-500', text: 'text-purple-600', key: 'fat', unit: 'g' }
    ];
    function getkey() {
        return 'foodlog-' + new Date().toLocaleDateString('en-CA');
    }
    function getsaved() {
        return JSON.parse(localStorage.getItem(getkey()) || '[]');
    }
    function round1(n) {
        return Math.round(n * 10) / 10;
    }
    function getdaylog(d) {
        const key = 'foodlog-' + d.toLocaleDateString('en-CA');
        return JSON.parse(localStorage.getItem(key) || '[]');
    }
    function gettotalcalories(items) {
        let total = 0;
        for (let i = 0; i < items.length; i++) {
            total += Number(items[i].calories) || 0;
        }
        return Math.round(total);
    }
    function getweekdata() {
        const week = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const items = getdaylog(d);
            week.push({
                date: d,
                items: items.length,
                calories: gettotalcalories(items)
            });
        }
        return week;
    }
    function getweeksummary(week) {
        let totalCal = 0;
        let totalItems = 0;
        let daysOnGoal = 0;
        for (let i = 0; i < week.length; i++) {
            totalCal += week[i].calories;
            totalItems += week[i].items;
            const cal = week[i].calories;
            if (cal >= goals.calories * 0.9 && cal <= goals.calories * 1.1)
                daysOnGoal++;
        }
        return {
            average: Math.round(totalCal / 7),
            totalItems: totalItems,
            daysOnGoal: daysOnGoal
        };
    }
    const weeklyChart = document.getElementById('weekly-chart');
    function renderweeksummary(week) {
        const s = getweeksummary(week);
        document.getElementById('week-avg').textContent = `${s.average} kcal`;
        document.getElementById('week-items').textContent =
            `${s.totalItems} ${s.totalItems === 1 ? 'item' : 'items'}`;
        document.getElementById('week-goal').textContent = `${s.daysOnGoal} / 7`;
    }
    function renderweekdays() {
        const week = getweekdata();
        let cartona = '';
        for (let i = 0; i < week.length; i++) {
            const day = week[i];
            const istoday = i === week.length - 1;
            const has = day.calories > 0;
            const numColor = has ? 'text-emerald-600' : 'text-gray-300';
            cartona += `
        <div class="text-center py-2 rounded-xl ${istoday ? 'bg-indigo-100' : ''}">
          <p class="text-xs text-gray-500">${day.date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
          <p class="font-medium text-gray-900 mb-1">${day.date.getDate()}</p>
          <p class="text-lg  font-bold ${numColor}">${day.calories}</p>
          <p class="text-xs ${numColor}">kcal</p>
          ${has ? `<p class="text-xs text-gray-400 mt-1">${day.items} ${day.items === 1 ? 'item' : 'items'}</p>` : ''}
        </div>`;
        }
        weeklyChart.className = 'grid grid-cols-7 gap-2';
        weeklyChart.innerHTML = cartona;
    }
    function renderprogress(saved) {
        for (let i = 0; i < cardStyles.length; i++) {
            const st = cardStyles[i];
            let total = 0;
            for (let j = 0; j < saved.length; j++)
                total += Number(saved[j][st.key]) || 0;
            total = Math.round(total);
            const goal = goals[st.key];
            const percent = Math.min(100, Math.round((total / goal) * 100));
            const over = total >= goal;
            const card = cards[i];
            card.className = 'bg-gray-50 rounded-xl p-4';
            card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">${st.key.charAt(0).toUpperCase() + st.key.slice(1)}</span>
<span class="text-xs ${over ? 'text-red-500' : st.text}">${percent}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div class="${over ? 'bg-red-500' : st.bar} h-2.5 rounded-full" style="width: ${percent}%"></div>
        </div>
<div class="flex items-center justify-between text-xs">
<span class="font-bold ${over ? 'text-red-600' : st.text}">${total} ${st.unit}</span>
          <span class="text-gray-400">/ ${goal} ${st.unit}</span>
        </div>`;
        }
    }
    function showfoodlog() {
        const saved = getsaved();
        renderprogress(saved);
        renderweekdays();
        renderweeksummary(getweekdata());
        todaySection.querySelector('h4').textContent = `Logged Items (${saved.length})`;
        clearBtn.style.display = saved.length === 0 ? 'none' : '';
        if (saved.length === 0) {
            list.innerHTML = `
  <div class="text-center py-8 text-gray-500">
    <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <i class="fa-solid fa-utensils text-3xl text-gray-300"></i>
    </div>
    <p class="font-medium text-gray-500 mb-2">No food logged today</p>
    <p class="text-sm text-gray-400 mb-4">Start tracking your nutrition by logging meals or scanning products</p>
    <div class="flex justify-center gap-3">
      <button id="browse-recipes-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
        <i class="fa-solid fa-plus mr-2"></i>Browse Recipes
      </button>
      <button id="scan-product-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
        <i class="fa-solid fa-barcode mr-2"></i>Scan Product
      </button>
    </div>
  </div>`;
            return;
        }
        let cartona = '';
        for (let i = 0; i < saved.length; i++) {
            const item = saved[i];
            const ismeal = item.type === 'meal';
            const image = ismeal && item.thumbnail
                ? `<img src="${item.thumbnail}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover shrink-0">`
                : `<div class="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
       <i class="fa-solid fa-box text-blue-600 text-xl"></i>
     </div>`;
            cartona += `
<div class="flex items-center justify-between gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-all rounded-xl ">
        <div class="flex items-center gap-4 min-w-0">
          ${image}
          <div class="min-w-0">
            <p class="font-semibold text-gray-900">${item.name}</p>
            <p class="text-sm text-gray-500">${item.brand} <span class="mx-1">•</span>
              <span class="${ismeal ? 'text-emerald-600' : 'text-blue-600'}">${ismeal ? 'Recipe' : 'Product'}</span>
            </p>
            <p class="text-xs text-gray-400 mt-1">${item.time}</p>
          </div>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <div class="text-center">
            <p class="text-xl font-bold text-emerald-600">${Math.round(item.calories)}</p>
            <p class="text-xs text-gray-500">kcal</p>
          </div>
          <div class="flex gap-2 text-xs">
            <span class="px-2 py-1 rounded-lg bg-blue-50 text-gray-600">${round1(item.protein)}g P</span>
            <span class="px-2 py-1 rounded-lg bg-amber-50 text-gray-600">${round1(item.carbs)}g C</span>
            <span class="px-2 py-1 rounded-lg bg-purple-50 text-gray-600">${round1(item.fat)}g F</span>
          </div>
          <button class="delete-log-item text-gray-400 hover:text-red-500" data-index="${i}" aria-label="Remove item">
        <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>`;
        }
        list.innerHTML = cartona;
    }
    list.addEventListener('click', function (e) {
        if (e.target.closest('#browse-recipes-btn')) {
            document.querySelectorAll('.nav-link')[0].click();
            return;
        }
        if (e.target.closest('#scan-product-btn')) {
            document.querySelectorAll('.nav-link')[1].click();
            return;
        }
        const btn = e.target.closest('.delete-log-item');
        if (!btn)
            return;
        const saved = getsaved();
        saved.splice(Number(btn.dataset.index), 1);
        localStorage.setItem(getkey(), JSON.stringify(saved));
        showfoodlog();
        showclearedtoast('Item removed from log');
    });
    function showclearedtoast(message = "Today's log cleared") {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.remove();
        }, 2000);
    }
    clearBtn.addEventListener('click', function () {
        Swal.fire({
            title: "Clear Today's Log?",
            text: 'This will remove all logged food items for today.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, clear it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        }).then(function (result) {
            if (result.isConfirmed) {
                localStorage.removeItem(getkey());
                showfoodlog();
                showclearedtoast();
                Swal.fire({
                    title: 'Cleared!',
                    text: 'Your food log has been cleared.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    });
    showfoodlog();
    window.addEventListener('foodlog-updated', showfoodlog);
    const navs = document.querySelectorAll('.nav-link');
    for (let i = 0; i < navs.length; i++) {
        navs[i].addEventListener('click', showfoodlog);
    }
})();
// loading
(function () {
    let Overlay = document.getElementById("app-loading-overlay");
    window.addEventListener("load", function () {
        Overlay.classList.add("opacity-0", "pointer-events-none");
        setTimeout(function () {
            Overlay.classList.add("loading");
        }, 500);
    });
})();
// sidebar toggle
(function () {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menubtn = document.getElementById('header-menu-btn');
    const closebtn = document.getElementById('sidebar-close-btn');
    function opensidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    }
    function closesidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
    menubtn.addEventListener('click', opensidebar);
    closebtn.addEventListener('click', closesidebar);
    overlay.addEventListener('click', closesidebar);
    const navlinks = document.querySelectorAll('.nav-link');
    for (let i = 0; i < navlinks.length; i++) {
        navlinks[i].addEventListener('click', closesidebar);
    }
})();
