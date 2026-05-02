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
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-10px)',
          boxShadow: '0 20px 30px rgba(0, 0, 0, 0.4)',
          borderColor: 'primary.main'
        }
      }}
    >
      <CardActionArea onClick={() => navigate(`/product/${product._id}`)} sx={{ flexGrow: 1, p: 1 }}>
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: 2,
            height: 160, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative background gradient */}
          <Box sx={{ position: 'absolute', width: '150%', height: '150%', background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, rgba(0,0,0,0) 70%)', top: '-25%', left: '-25%' }} />
          
          <Typography variant="h1" sx={{ zIndex: 1, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
            {product.category === 'Laptop' ? '💻' : product.category === 'Phone' ? '📱' : '📦'}
          </Typography>
        </Box>
        <CardContent sx={{ px: 1, pt: 3 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap sx={{ fontWeight: 600 }}>
            {product.productName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
            {product.company}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
              ${product.price}
            </Typography>
            <Chip 
              label={`${product.discount}% OFF`} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255, 23, 68, 0.1)', 
                color: 'secondary.main',
                fontWeight: 'bold',
                border: '1px solid rgba(255, 23, 68, 0.3)'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ color: '#FFD700' }}>★</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {product.rating}
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                color: product.availability === 'yes' ? '#00e676' : 'text.secondary',
                px: 1, py: 0.5, borderRadius: 1,
                bgcolor: product.availability === 'yes' ? 'rgba(0, 230, 118, 0.1)' : 'transparent'
              }}
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
