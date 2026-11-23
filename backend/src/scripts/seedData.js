require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Food = require('../models/Food');

const categoriesData = [
  {
    name: 'Burgers',
    slug: 'burgers',
    description: 'Juicy gourmet beef, crispy chicken, and veggie patties cooked to perfection.',
    image: '/images/burger.jpg',
    isActive: true
  },
  {
    name: 'Pizzas',
    slug: 'pizzas',
    description: 'Hand-tossed crust with rich tomato sauce and premium melted mozzarella.',
    image: '/images/pizza.jpg',
    isActive: true
  },
  {
    name: 'Salads',
    slug: 'salads',
    description: 'Fresh farm-picked greens, nutrient-dense bowls, and flavorful light dressings.',
    image: '/images/salad.jpg',
    isActive: true
  },
  {
    name: 'Grills & BBQ',
    slug: 'grills',
    description: 'Smoky flame-grilled meats and spicy skewers marinated in house spices.',
    image: '/images/grilled-food.jpg',
    isActive: true
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_ordering');
    console.log('[SeedData] Connected to MongoDB');

    console.log('[SeedData] Seeding categories...');
    const categoryMap = {};

    for (const cat of categoriesData) {
      let existingCat = await Category.findOne({ slug: cat.slug });
      if (!existingCat) {
        existingCat = await Category.create(cat);
        console.log(`  + Category created: ${cat.name}`);
      } else {
        console.log(`  * Category already exists: ${cat.name}`);
      }
      categoryMap[cat.slug] = existingCat._id;
    }

    const foodsData = [
      {
        name: 'Classic Cheeseburger',
        description: 'Tender beef patty with melted cheddar cheese, lettuce, tomato, pickles, and our signature burger sauce.',
        category: categoryMap['burgers'],
        price: 350,
        image: '/images/burger.jpg',
        isAvailable: true,
        preparationTimeMinutes: 15
      },
      {
        name: 'Crispy Chicken Burger',
        description: 'Crisp golden battered chicken breast with creamy coleslaw and spicy mayo on a toasted brioche bun.',
        category: categoryMap['burgers'],
        price: 390,
        image: '/images/burger.jpg',
        isAvailable: true,
        preparationTimeMinutes: 15
      },
      {
        name: 'Double Bacon Beast Burger',
        description: 'Double beef patties, crispy bacon rashers, double cheese, caramelized onions, and BBQ glaze.',
        category: categoryMap['burgers'],
        price: 540,
        image: '/images/burger.jpg',
        isAvailable: true,
        preparationTimeMinutes: 20
      },
      {
        name: 'Woodfired Margherita Pizza',
        description: 'Italian San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil leaves, and extra virgin olive oil.',
        category: categoryMap['pizzas'],
        price: 480,
        image: '/images/pizza.jpg',
        isAvailable: true,
        preparationTimeMinutes: 25
      },
      {
        name: 'Spicy Pepperoni Feast Pizza',
        description: 'Loaded with seasoned beef pepperoni slices, chili flakes, and gooey melted mozzarella.',
        category: categoryMap['pizzas'],
        price: 640,
        image: '/images/pizza.jpg',
        isAvailable: true,
        preparationTimeMinutes: 25
      },
      {
        name: 'Smoky BBQ Chicken Pizza',
        description: 'Grilled BBQ chicken chunks, red onion slices, bell peppers, fresh cilantro, and rich BBQ sauce.',
        category: categoryMap['pizzas'],
        price: 680,
        image: '/images/pizza.jpg',
        isAvailable: true,
        preparationTimeMinutes: 25
      },
      {
        name: 'Greek Mediterranean Salad',
        description: 'Crisp romaine lettuce, cherry tomatoes, kalamata olives, cucumber, red onion, and crumbly feta cheese.',
        category: categoryMap['salads'],
        price: 320,
        image: '/images/salad.jpg',
        isAvailable: true,
        preparationTimeMinutes: 10
      },
      {
        name: 'Grilled Chicken Caesar Salad',
        description: 'Herb grilled chicken strips, crispy garlic croutons, shaved parmesan cheese, and creamy caesar dressing.',
        category: categoryMap['salads'],
        price: 420,
        image: '/images/salad.jpg',
        isAvailable: true,
        preparationTimeMinutes: 12
      },
      {
        name: 'Spicy Flame Grilled Platter',
        description: 'Charred spicy chicken skewers served with seasoned pita bread, garlic toum, and pickled vegetables.',
        category: categoryMap['grills'],
        price: 650,
        image: '/images/grilled-food.jpg',
        isAvailable: true,
        preparationTimeMinutes: 20
      },
      {
        name: 'Tandoori BBQ Chicken Wings',
        description: 'Smoky wings glazed in fiery tandoori spices and garnished with fresh lemon wedges and mint chutney.',
        category: categoryMap['grills'],
        price: 490,
        image: '/images/grilled-food.jpg',
        isAvailable: true,
        preparationTimeMinutes: 18
      }
    ];

    console.log('[SeedData] Seeding foods...');
    for (const food of foodsData) {
      const existingFood = await Food.findOne({ name: food.name });
      if (!existingFood) {
        await Food.create(food);
        console.log(`  + Food created: ${food.name} (NPR ${food.price})`);
      } else {
        console.log(`  * Food already exists: ${food.name}`);
      }
    }

    console.log('--------------------------------------------------');
    console.log('[SeedData] Data seeding completed successfully!');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[SeedData Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();
