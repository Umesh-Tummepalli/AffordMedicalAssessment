import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Card, CardContent, Chip, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // We don't have the category in the URL for the details page based on standard routing,
        // but our backend endpoint is /categories/:categoryname/products/:productid.
        // Let's modify the backend to also support fetching just by productid or assume a dummy category if needed.
        // Wait, the backend endpoint expects category.
        // Let's just create an endpoint in backend `GET /products/:productid` for simplicity.
        // For now, I will use a dummy category because our backend `findById` doesn't actually need it if we change the route.
        // Let's use the provided backend route: /categories/dummy/products/:productid (it ignores dummy and fetches by ID).
        const res = await axios.get(`http://localhost:3000/categories/dummy/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Error fetching product details', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error || !product) return <Typography align="center" color="error" sx={{ mt: 5 }}>Error loading product.</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 3 }}>&larr; Back to Products</Button>
      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, boxShadow: 4 }}>
        <Box sx={{ width: { xs: '100%', md: '40%' }, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <Typography variant="h1" color="text.secondary">📦</Typography>
        </Box>
        <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="overline" color="text.secondary" gutterBottom>
            {product.company} • {product.category}
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {product.productName}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" color="primary.main" sx={{ mr: 2 }}>
              ${product.price}
            </Typography>
            {product.discount > 0 && (
              <Chip label={`${product.discount}% OFF`} color="secondary" />
            )}
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Rating</Typography>
              <Typography variant="h6">⭐ {product.rating} / 5</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Availability</Typography>
              <Typography variant="h6" color={product.availability === 'yes' ? 'success.main' : 'error.main'}>
                {product.availability === 'yes' ? 'In Stock' : 'Out of Stock'}
              </Typography>
            </Grid>
          </Grid>
          
          <Button variant="contained" size="large" fullWidth disabled={product.availability !== 'yes'}>
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProductDetails;
