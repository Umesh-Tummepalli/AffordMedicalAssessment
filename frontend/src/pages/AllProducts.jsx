import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Box, FormControl, InputLabel, 
  Select, MenuItem, TextField, Button, Pagination, CircularProgress 
} from '@mui/material';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Phone', 'Computer', 'TV', 'Earphone', 'Tablet', 'Charger', 'Mouse', 'Keypad', 'Bluetooth', 'Pendrive', 'Remote', 'Speaker', 'Headset', 'Laptop', 'PC'];

const AllProducts = () => {
  const [products, setProducts] =   useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('Laptop');
  const [n, setN] = useState(10);
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState('price');
  const [order, setOrder] = useState('asc');
  
  // Total pages mock since the API doesn't return total count
  const totalPages = 10; 

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/categories/${category}/products`, {
        params: { n, page, minPrice, maxPrice, sort, order }
      });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sort, order]); // Refetch on page or sort change

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on filter change
    fetchProducts();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
        Top Products
      </Typography>

      <Box component="form" onSubmit={handleFilterSubmit} sx={{ mb: 4, p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField 
              fullWidth size="small" type="number" label="Min Price" 
              value={minPrice} onChange={(e) => setMinPrice(e.target.value)} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField 
              fullWidth size="small" type="number" label="Max Price" 
              value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="discount">Discount</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select value={order} label="Order" onChange={(e) => setOrder(e.target.value)}>
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={1}>
            <Button type="submit" variant="contained" fullWidth>Apply</Button>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {products.length > 0 ? products.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Typography variant="h6" align="center" color="text.secondary">
                  No products found.
                </Typography>
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(e, value) => setPage(value)} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default AllProducts;
