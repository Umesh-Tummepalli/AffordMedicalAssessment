import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardActionArea onClick={() => navigate(`/product/${product._id}`)} sx={{ flexGrow: 1 }}>
        <Box sx={{ p: 2, bgcolor: 'grey.200', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h1" color="text.secondary">
            📦
          </Typography>
        </Box>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {product.productName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {product.company}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6" color="primary.main">
              ${product.price}
            </Typography>
            <Chip 
              label={`${product.discount}% OFF`} 
              size="small" 
              color="secondary" 
              variant="outlined" 
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2">
              ⭐ {product.rating}
            </Typography>
            <Typography 
              variant="body2" 
              color={product.availability === 'yes' ? 'success.main' : 'error.main'}
            >
              {product.availability === 'yes' ? 'In Stock' : 'Out of Stock'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard;
