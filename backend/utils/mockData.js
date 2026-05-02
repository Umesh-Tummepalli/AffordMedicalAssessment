const generateMockProducts = (company, category, count, minPrice, maxPrice) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    const price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
    const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
    const discount = Math.floor(Math.random() * 50); // 0 to 49
    const availability = Math.random() > 0.2 ? 'yes' : 'out-of-stock';
    
    products.push({
      productName: `${company} ${category} ${i + 1}`,
      price,
      rating: parseFloat(rating),
      discount,
      availability,
      company,
      category
    });
  }
  return products;
};

const fetchMockData = async (company, category, top, minPrice, maxPrice) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return generateMockProducts(company, category, top, minPrice || 1, maxPrice || 100000);
};

module.exports = { fetchMockData };
