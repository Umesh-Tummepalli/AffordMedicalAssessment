import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Card, CardContent, Chip, CircularProgress, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}><CircularProgress size={60} thickness={4} /></Box>;
  if (error || !product) return <Typography align="center" color="error" variant="h5" sx={{ mt: 10 }}>Error loading product.</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 4, color: 'text.secondary', '&:hover': { color: 'primary.main', background: 'transparent' } }}
      >
        Back to Products
      </Button>
      
      <Card sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.9) 0%, rgba(10, 25, 47, 0.9) 100%)',
        overflow: 'hidden'
      }}>
        <Box 
          sx={{ 
            width: { xs: '100%', md: '45%' }, 
            bgcolor: 'rgba(255,255,255,0.02)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: { xs: 300, md: 500 },
            position: 'relative',
            borderRight: { md: '1px solid rgba(255,255,255,0.05)' },
            borderBottom: { xs: '1px solid rgba(255,255,255,0.05)', md: 'none' }
          }}
        >
          <Box sx={{ position: 'absolute', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, rgba(0,0,0,0) 60%)', top: '-50%', left: '-50%' }} />
          <Typography variant="h1" sx={{ fontSize: '8rem', zIndex: 1, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>
            {product.category === 'Laptop' ? '💻' : product.category === 'Phone' ? '📱' : '📦'}
          </Typography>
        </Box>
        <CardContent sx={{ p: { xs: 4, md: 6 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Chip label={product.company} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', fontWeight: 'bold' }} />
            <Chip label={product.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', fontWeight: 'bold' }} />
          </Box>
          
          <Typography variant="h3" component="h1" gutterBottom fontWeight="800" sx={{ color: 'white' }}>
            {product.productName}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, mt: 2 }}>
            <Typography variant="h2" color="primary.main" sx={{ fontWeight: 800, mr: 3 }}>
              ${product.price}
            </Typography>
            {product.discount > 0 && (
              <Chip 
                icon={<LocalOfferIcon />}
                label={`${product.discount}% OFF`} 
                color="secondary" 
                sx={{ fontSize: '1rem', py: 2.5, px: 1, fontWeight: 'bold' }}
              />
            )}
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={6}>
              <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Customer Rating</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ color: '#FFD700' }}>★</Typography>
                  <Typography variant="h5" fontWeight="bold" color="white">{product.rating} / 5</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Availability Status</Typography>
                <Typography variant="h5" fontWeight="bold" color={product.availability === 'yes' ? '#00e676' : 'error.main'}>
                  {product.availability === 'yes' ? 'In Stock Ready' : 'Currently Unavailable'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<ShoppingCartIcon />}
            disabled={product.availability !== 'yes'}
            sx={{ 
              py: 2, 
              fontSize: '1.1rem',
              background: product.availability === 'yes' ? 'linear-gradient(45deg, #00e5ff 30%, #2979ff 90%)' : 'rgba(255,255,255,0.1)',
              color: product.availability === 'yes' ? 'black' : 'text.disabled',
              '&:hover': {
                background: 'linear-gradient(45deg, #2979ff 30%, #00e5ff 90%)',
              }
            }}
          >
            {product.availability === 'yes' ? 'Add to Shopping Cart' : 'Out of Stock'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProductDetails;
