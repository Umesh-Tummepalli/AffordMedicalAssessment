import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Box, FormControl, InputLabel, 
  Select, MenuItem, TextField, Button, Pagination, CircularProgress,
  Paper, IconButton, Collapse
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Phone', 'Computer', 'TV', 'Earphone', 'Tablet', 'Charger', 'Mouse', 'Keypad', 'Bluetooth', 'Pendrive', 'Remote', 'Speaker', 'Headset', 'Laptop', 'PC'];

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('Laptop');
  const [n, setN] = useState(10);
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState('price');
  const [order, setOrder] = useState('asc');
  
  const [showFilters, setShowFilters] = useState(true);

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
  }, [page, sort, order]); 

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" gutterBottom fontWeight="800" sx={{ background: '-webkit-linear-gradient(45deg, #00e5ff 30%, #2979ff 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Discover Products
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Find the best deals across all major e-commerce platforms.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />} 
          onClick={() => setShowFilters(!showFilters)}
          sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'text.primary' }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>

      <Collapse in={showFilters}>
        <Paper component="form" onSubmit={handleFilterSubmit} sx={{ mb: 6, p: 3, borderRadius: 3, background: 'rgba(17, 34, 64, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="filled" sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                <InputLabel sx={{ color: 'text.secondary' }}>Category</InputLabel>
                <Select value={category} onChange={(e) => setCategory(e.target.value)} disableUnderline sx={{ color: 'white' }}>
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField 
                fullWidth variant="filled" type="number" label="Min Price" 
                value={minPrice} onChange={(e) => setMinPrice(e.target.value)} 
                InputProps={{ disableUnderline: true, sx: { color: 'white' } }}
                sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}
                InputLabelProps={{ sx: { color: 'text.secondary' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField 
                fullWidth variant="filled" type="number" label="Max Price" 
                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} 
                InputProps={{ disableUnderline: true, sx: { color: 'white' } }}
                sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}
                InputLabelProps={{ sx: { color: 'text.secondary' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="filled" sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                <InputLabel sx={{ color: 'text.secondary' }}>Sort By</InputLabel>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} disableUnderline sx={{ color: 'white' }}>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="discount">Discount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="filled" sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                <InputLabel sx={{ color: 'text.secondary' }}>Order</InputLabel>
                <Select value={order} onChange={(e) => setOrder(e.target.value)} disableUnderline sx={{ color: 'white' }}>
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={1}>
              <Button type="submit" variant="contained" fullWidth sx={{ py: 2 }}>Apply</Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {products.length > 0 ? products.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <Typography variant="h5" color="text.secondary">
                    No products found matching your criteria.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {products.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, mb: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={(e, value) => setPage(value)} 
                color="primary" 
                size="large"
                sx={{ 
                  '& .MuiPaginationItem-root': { color: 'text.primary', borderColor: 'rgba(255,255,255,0.1)' },
                  '& .Mui-selected': { bgcolor: 'primary.main', color: '#000 !important' }
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default AllProducts;
