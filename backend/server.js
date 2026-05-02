const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { fetchMockData } = require('./utils/mockData');
const Product = require('./models/Product');

const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const COMPANIES = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];

// Connect to MongoDB
let mongoServer;
const startServer = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  console.log(`Connected to in-memory MongoDB at ${mongoUri}`);
};
startServer().catch(console.error);

// GET /categories/:categoryname/products
app.get('/categories/:categoryname/products', async (req, res) => {
  try {
    const { categoryname } = req.params;
    let { n = 10, page = 1, minPrice = 0, maxPrice = 1000000, sort, order = 'asc' } = req.query;
    
    n = parseInt(n);
    page = parseInt(page);
    minPrice = parseInt(minPrice);
    maxPrice = parseInt(maxPrice);

    // To handle pagination accurately across companies, we fetch n * page from each company
    // in a real scenario to ensure we have enough global top items.
    const fetchTop = n * page;

    // Fetch from all companies concurrently
    const fetchPromises = COMPANIES.map(company => 
      fetchMockData(company, categoryname, fetchTop, minPrice, maxPrice)
    );
    
    const results = await Promise.all(fetchPromises);
    let allProducts = results.flat();

    // Store in MongoDB and get assigned IDs
    const savedProducts = [];
    for (const p of allProducts) {
      // Upsert based on productName, company, category
      const saved = await Product.findOneAndUpdate(
        { productName: p.productName, company: p.company, category: p.category },
        { $set: p },
        { upsert: true, new: true }
      );
      savedProducts.push(saved);
    }

    // Now sort
    if (sort) {
      savedProducts.sort((a, b) => {
        let valA = a[sort];
        let valB = b[sort];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Paginate
    const startIndex = (page - 1) * n;
    const paginatedProducts = savedProducts.slice(startIndex, startIndex + n);

    res.json(paginatedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /categories/:categoryname/products/:productid
app.get('/categories/:categoryname/products/:productid', async (req, res) => {
  try {
    const { productid } = req.params;
    const product = await Product.findById(productid);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
