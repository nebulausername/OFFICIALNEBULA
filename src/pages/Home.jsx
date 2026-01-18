import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { api } from '@/api';
import { API_BASE_URL } from '@/api/config';
import { Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ProductQuickView from '../components/products/ProductQuickView';
import DeliveryBar from '../components/delivery/DeliveryBar';
import CategoryCard from '../components/home/CategoryCard';
import FreshDropsSection from '../components/home/FreshDropsSection';
import CategoryProductsSection from '../components/home/CategoryProductsSection';

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [departmentProductCounts, setDepartmentProductCounts] = useState({});
  const [departmentProducts, setDepartmentProducts] = useState({});
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDeptProducts, setLoadingDeptProducts] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    loadDepartments();
    loadProducts();
  }, []);

  useEffect(() => {
    // Load product counts for each department
    if (departments.length > 0) {
      loadDepartmentProductCounts();
      loadDepartmentProducts();
    }
  }, [departments]);

  const loadDepartments = async () => {
    try {
      console.log('🏢 Loading departments...');
      
      // #region agent log
      fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartments:start',message:'Loading departments',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      
      const depts = await api.entities.Department.list('sort_order');
      console.log('✅ Departments loaded:', depts.length);
      depts.forEach(dept => {
        console.log(`   - ${dept.name} (ID: ${dept.id}, Slug: ${dept.slug})`);
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartments:loaded',message:'Departments loaded',data:{count:depts.length,departments:depts.map(d=>({id:d.id,name:d.name,slug:d.slug}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      
      setDepartments(depts);
    } catch (error) {
      console.error('❌ Error loading departments:', error);
      console.error('Error details:', error.message, error.stack);
      
      // #region agent log
      fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartments:error',message:'Error loading departments',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
    } finally {
      setLoadingDepts(false);
    }
  };

  // Test-Funktion für API-Debugging
  const testAPI = async () => {
    console.group('🧪 API Test Suite');
    try {
      // Test 1: Alle Produkte
      console.log('Test 1: Loading all products...');
      const allProducts = await api.entities.Product.list('-created_at', 20);
      console.log(`✅ All products: ${allProducts.length}`, allProducts);
      
      // Test 2: Mit Department Filter
      if (departments.length > 0) {
        const dept = departments[0];
        console.log(`Test 2: Loading products for ${dept.name} (ID: ${dept.id})...`);
        const deptProducts = await api.entities.Product.filter({ department_id: dept.id });
        console.log(`✅ Products for ${dept.name}: ${deptProducts.length}`, deptProducts);
      }
      
      // Test 3: Direkter Fetch
      console.log('Test 3: Direct fetch test...');
      console.log('   API Base URL:', API_BASE_URL);
      const directFetch = await fetch(`${API_BASE_URL}/products?limit=10`);
      if (directFetch.ok) {
        const directData = await directFetch.json();
        console.log('✅ Direct fetch:', directData);
      } else {
        console.error('❌ Direct fetch failed:', directFetch.status, directFetch.statusText);
      }
      
      // Test 4: Alle Departments
      console.log('Test 4: Loading all departments...');
      const allDepts = await api.entities.Department.list();
      console.log(`✅ All departments: ${allDepts.length}`, allDepts);
      
    } catch (error) {
      console.error('❌ API Test failed:', error);
      console.error('Error details:', error.message, error.stack);
    }
    console.groupEnd();
  };

  // Expose test function to window for manual testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.testNebulaAPI = testAPI;
      console.log('💡 API Test function available: window.testNebulaAPI()');
    }
  }, [departments]);

  const loadDepartmentProductCounts = async () => {
    try {
      console.log('📊 Loading department product counts...');
      const counts = {};
      for (const dept of departments) {
        try {
          const deptProducts = await api.entities.Product.filter({ department_id: dept.id });
          counts[dept.id] = Array.isArray(deptProducts) ? deptProducts.length : 0;
          console.log(`   ${dept.name}: ${counts[dept.id]} products`);
        } catch (err) {
          console.warn(`⚠️ Error loading product count for ${dept.name} (${dept.id}):`, err);
          counts[dept.id] = 0;
        }
      }
      setDepartmentProductCounts(counts);
      console.log('✅ Product counts loaded:', counts);
    } catch (error) {
      console.error('❌ Error loading department product counts:', error);
    }
  };

  const loadDepartmentProducts = async () => {
    try {
      console.log('🚀 Starting loadDepartmentProducts...');
      console.log('📋 Departments to load:', departments.length);
      departments.forEach(dept => {
        console.log(`  - ${dept.name} (ID: ${dept.id}, Slug: ${dept.slug})`);
      });

      const loadingStates = {};
      const productsByDept = {};
      
      // Initialize loading states
      departments.forEach(dept => {
        loadingStates[dept.id] = true;
      });
      setLoadingDeptProducts(loadingStates);

      // Load products in parallel for all departments
      await Promise.all(
        departments.map(async (dept) => {
          console.group(`🔍 Loading products for ${dept.name}`);
          
          // #region agent log
          fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:dept-start',message:'Starting product load for department',data:{deptId:dept.id,deptName:dept.name,deptSlug:dept.slug},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          
          try {
            // Entferne in_stock Filter komplett - lade alle Produkte
            const queryParams = { department_id: dept.id };
            console.log('📤 API Request:', {
              endpoint: '/products',
              params: queryParams,
              sort: '-created_at',
              limit: 8
            });

            // #region agent log
            fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:before-api',message:'Before API filter call',data:{deptId:dept.id,queryParams,sort:'-created_at',limit:8},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion

            const prods = await api.entities.Product.filter(
              queryParams,
              '-created_at',
              8
            );
            
            // #region agent log
            fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:after-api',message:'After API filter call',data:{deptId:dept.id,prodsLength:prods?.length||0,prodsType:typeof prods,isArray:Array.isArray(prods),firstProduct:prods&&prods.length>0?{id:prods[0].id,name:prods[0].name,deptId:prods[0].department_id}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            
            console.log('📥 Raw API Response:', prods);
            console.log('📊 Response type:', typeof prods, Array.isArray(prods) ? 'Array' : 'Not Array');
            console.log('📊 Response length:', prods?.length || 0);
            
            if (prods && prods.length > 0) {
              console.log('✅ Products loaded:', prods.map(p => ({ id: p.id, name: p.name, dept_id: p.department_id })));
              
              // #region agent log
              fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:products-loaded',message:'Products successfully loaded',data:{deptId:dept.id,productCount:prods.length,productDeptIds:prods.map(p=>p.department_id),expectedDeptId:dept.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
              // #endregion
            }
            
            productsByDept[dept.id] = Array.isArray(prods) ? prods : [];
            
            if (productsByDept[dept.id].length === 0) {
              console.warn(`⚠️ No products found for department: ${dept.name} (ID: ${dept.id})`);
              console.warn('   Checking if products exist in database...');
              
              // #region agent log
              fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:no-products',message:'No products found, testing all products',data:{deptId:dept.id,deptName:dept.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
              // #endregion
              
              // Test: Lade alle Produkte ohne Filter
              try {
                const allProds = await api.entities.Product.list('-created_at', 50);
                console.log(`   Total products in database: ${allProds?.length || 0}`);
                
                // #region agent log
                fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:all-products-test',message:'All products test result',data:{totalProducts:allProds?.length||0,allProductDeptIds:allProds?.map(p=>p.department_id)||[],expectedDeptId:dept.id,matchingCount:allProds?.filter(p=>p.department_id===dept.id).length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
                // #endregion
                
                if (allProds && allProds.length > 0) {
                  const matchingProds = allProds.filter(p => p.department_id === dept.id);
                  console.log(`   Products matching department_id ${dept.id}: ${matchingProds.length}`);
                  if (matchingProds.length > 0) {
                    console.log('   Matching products:', matchingProds.map(p => ({ id: p.id, name: p.name, dept_id: p.department_id })));
                  } else {
                    // #region agent log
                    fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:no-matching',message:'No matching products found',data:{deptId:dept.id,allProductDeptIds:allProds.map(p=>p.department_id),uniqueDeptIds:[...new Set(allProds.map(p=>p.department_id))]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
                    // #endregion
                  }
                } else {
                  // #region agent log
                  fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:no-products-in-db',message:'No products in database at all',data:{deptId:dept.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
                  // #endregion
                }
              } catch (testErr) {
                console.error('   Error testing all products:', testErr);
                // #region agent log
                fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:test-error',message:'Error testing all products',data:{deptId:dept.id,error:testErr.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
                // #endregion
              }
            }
          } catch (err) {
            console.error(`❌ Error loading products for ${dept.name}:`, err);
            console.error('Error details:', err.message);
            console.error('Error stack:', err.stack);
            
            // #region agent log
            fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:error',message:'Error loading products',data:{deptId:dept.id,error:err.message,status:err.status,stack:err.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion
            
            // Fallback: Versuche ohne Filter
            try {
              console.log(`🔄 Retrying without department filter for ${dept.name}...`);
              const fallbackProds = await api.entities.Product.list('-created_at', 8);
              console.log(`   Fallback loaded ${fallbackProds?.length || 0} products`);
              productsByDept[dept.id] = Array.isArray(fallbackProds) ? fallbackProds : [];
              
              // #region agent log
              fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:fallback-success',message:'Fallback load successful',data:{deptId:dept.id,fallbackCount:fallbackProds?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
              // #endregion
            } catch (fallbackErr) {
              console.error(`❌ Fallback also failed for ${dept.name}:`, fallbackErr);
              productsByDept[dept.id] = [];
              
              // #region agent log
              fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:fallback-error',message:'Fallback also failed',data:{deptId:dept.id,error:fallbackErr.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
              // #endregion
            }
          } finally {
            loadingStates[dept.id] = false;
            
            // #region agent log
            fetch('http://127.0.0.1:7598/ingest/56ffd1df-b6f5-46c3-9934-bd492350b6cd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Home.jsx:loadDepartmentProducts:dept-end',message:'Department product load completed',data:{deptId:dept.id,finalCount:productsByDept[dept.id]?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            
            console.groupEnd();
          }
        })
      );

      setDepartmentProducts(productsByDept);
      setLoadingDeptProducts(loadingStates);
      
      // Log summary
      const totalProducts = Object.values(productsByDept).reduce((sum, prods) => sum + (prods?.length || 0), 0);
      console.log(`✅ Total loaded: ${totalProducts} products across ${departments.length} departments`);
      
      // Detailed summary per department
      Object.keys(productsByDept).forEach(deptId => {
        const dept = departments.find(d => d.id === deptId);
        const count = productsByDept[deptId]?.length || 0;
        console.log(`   ${dept?.name || deptId}: ${count} products`);
      });
    } catch (error) {
      console.error('❌ Critical error loading department products:', error);
      console.error('Error stack:', error.stack);
      
      // Set all loading states to false on error
      const loadingStates = {};
      departments.forEach(dept => {
        loadingStates[dept.id] = false;
      });
      setLoadingDeptProducts(loadingStates);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      // Try direct API call first
      let prods = [];
      try {
        const response = await api.get('/products', { sort: '-created_at', limit: 16 });
        prods = Array.isArray(response) ? response : (response.data || []);
        console.log('✅ Direct API call successful:', prods.length, 'products');
      } catch (err) {
        console.warn('Direct API call failed, trying entities API:', err.message);
        // Fallback to entities API
        try {
          prods = await api.entities.Product.list('-created_at', 16);
          console.log('✅ Entities API call successful:', prods.length, 'products');
        } catch (err2) {
          console.error('Entities API also failed:', err2.message);
          // Last resort: try without authentication
          try {
            const fallbackResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products?limit=16&sort=-created_at`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              prods = Array.isArray(fallbackData) ? fallbackData : (fallbackData.data || []);
              console.log('✅ Fallback API call successful:', prods.length, 'products');
            } else {
              console.error('Fallback response not OK:', fallbackResponse.status, fallbackResponse.statusText);
            }
          } catch (err3) {
            console.error('All API calls failed:', err3.message);
            prods = [];
          }
        }
      }
      
      // Ensure we have an array
      if (!Array.isArray(prods)) {
        console.warn('Products is not an array:', typeof prods, prods);
        prods = [];
      }
      
      setProducts(prods);
      console.log(`✅ Total loaded: ${prods.length} products for FreshDrops`);
      if (prods.length === 0) {
        console.warn('⚠️ No products found for FreshDrops!');
        console.warn('   Make sure:');
        console.warn('   1. Backend is running: cd backend && npm run dev');
        console.warn('   2. Database is seeded: cd backend && npm run db:seed');
        console.warn('   3. API URL is correct:', import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
      console.error('Error stack:', error.stack);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = async (product, quantity = 1, selectedOptions = {}) => {
    try {
      const user = await api.auth.me();
      const existing = await api.entities.StarCartItem.filter({
        user_id: user.id,
        product_id: product.id
      });

      if (existing.length > 0) {
        await api.entities.StarCartItem.update(existing[0].id, {
          quantity: existing[0].quantity + quantity,
          selected_options: selectedOptions
        });
      } else {
        await api.entities.StarCartItem.create({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
          selected_options: selectedOptions
        });
      }
      setIsQuickViewOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Animated Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 70%)' }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.15, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 70%)' }}
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(var(--gold-rgb), 0.15), transparent 70%)' }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Ultra Premium Floating Logo */}
            <motion.div
              animate={{ 
                y: [0, -20, 0]
              }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="inline-block mb-12"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 60px rgba(var(--gold-rgb), 0.6)',
                      '0 0 100px rgba(var(--gold-rgb), 0.8)',
                      '0 0 60px rgba(var(--gold-rgb), 0.6)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] p-4 mx-auto relative"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
                    border: '2px solid rgba(var(--gold-rgb), 0.5)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)'
                  }}
                >
                  <div className="absolute inset-0 rounded-[2.5rem]" 
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(var(--gold-rgb), 0.2), transparent 70%)'
                    }}
                  />
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                    alt="Nebula Supply"
                    className="relative w-full h-full object-contain drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(var(--gold-rgb), 0.5))' }}
                  />
                </motion.div>
                {/* Premium Orbital Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-6 border-2 rounded-full"
                  style={{ 
                    borderColor: 'rgba(var(--gold-rgb), 0.4)',
                    boxShadow: '0 0 30px rgba(var(--gold-rgb), 0.3)'
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-10 border-2 rounded-full"
                  style={{ 
                    borderColor: 'rgba(var(--gold-rgb), 0.3)',
                    boxShadow: '0 0 40px rgba(var(--gold-rgb), 0.2)'
                  }}
                />
                {/* Sparkle Accents */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                    boxShadow: '0 0 30px rgba(var(--gold-rgb), 0.8)'
                  }}
                >
                  <Sparkles className="w-4 h-4 text-zinc-900" />
                </motion.div>
              </div>
            </motion.div>

            {/* Ultra Premium Headline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
                <motion.span 
                  className="block bg-gradient-to-r from-white via-zinc-100 to-white bg-clip-text text-transparent"
                  style={{ 
                    textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
                    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))'
                  }}
                >
                  NEBULA
                </motion.span>
                <motion.span 
                  className="block bg-gradient-to-r from-[#E8C76A] via-[#F5D98B] to-[#E8C76A] bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ 
                    backgroundSize: '200% auto',
                    textShadow: '0 0 60px rgba(var(--gold-rgb), 0.6)',
                    filter: 'drop-shadow(0 0 30px rgba(var(--gold-rgb), 0.4))'
                  }}
                >
                  SUPPLY
                </motion.span>
              </h1>
            </motion.div>

            {/* Premium Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-bold tracking-wide"
              style={{ 
                color: 'rgba(255, 255, 255, 0.85)',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              Premium Lifestyle •{' '}
              <span className="bg-gradient-to-r from-[#E8C76A] to-[#F5D98B] bg-clip-text text-transparent font-black">
                Exklusiv für dich
              </span>{' '}
              <span className="inline-block">✨</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link to={createPageUrl('Products')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 40px rgba(var(--gold-rgb), 0.4)',
                        '0 0 60px rgba(var(--gold-rgb), 0.5)',
                        '0 0 40px rgba(var(--gold-rgb), 0.4)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl blur-xl"
                  />
                  <Button className="btn-gold relative h-16 px-12 text-lg rounded-2xl">
                    <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                    Jetzt shoppen
                  </Button>
                </motion.div>
              </Link>

              <Link to={createPageUrl('VIP')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="h-16 px-10 text-lg rounded-2xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, rgba(214, 178, 94, 0.15), rgba(214, 178, 94, 0.08))',
                      border: '2px solid rgba(214, 178, 94, 0.5)',
                      color: '#F5D98B',
                      boxShadow: '0 0 30px rgba(214, 178, 94, 0.2)'
                    }}
                  >
                    <Star className="w-6 h-6 mr-2" style={{ color: '#E8C76A' }} fill="currentColor" />
                    VIP werden
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Delivery Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-4xl mx-auto"
            >
              <DeliveryBar />
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-16 grid grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto"
            >
              {[
                { value: '500+', label: 'Produkte', icon: '📦', color: 'from-purple-500 to-pink-500' },
                { value: '10k+', label: 'Happy Customers', icon: '⭐', color: 'from-amber-500 to-orange-500' },
                { value: '24/7', label: 'Support', icon: '💬', color: 'from-cyan-500 to-blue-500' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative text-center p-5 md:p-6 rounded-2xl overflow-hidden group cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />
                  <div className="relative">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#E8C76A] to-[#F5D98B] bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm font-bold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Departments Section - Premium Redesign */}
      <section className="py-20 md:py-28 relative z-10" style={{ background: '#0B0D12' }}>
        {/* Subtle Corner Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-[150px] opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%)' }}
          />
          <div 
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[150px] opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%)' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(214, 178, 94, 0.15), transparent 70%)' }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 md:mb-16 text-center"
          >
            {/* Premium Badge - Smaller & Refined */}
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              whileInView={{ scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full"
              style={{
                background: 'rgba(214, 178, 94, 0.08)',
                border: '1px solid rgba(214, 178, 94, 0.25)'
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#F2D27C' }} />
              <span 
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#F2D27C' }}
              >
                Unsere Welten
              </span>
            </motion.div>

            {/* Title - High Contrast */}
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ 
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
              }}
            >
              Kategorien
            </motion.h2>

            {/* Subtitle - Better Readability */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg font-medium max-w-md mx-auto leading-relaxed"
              style={{ color: 'rgba(255, 255, 255, 0.72)' }}
            >
              Tauche ein in unsere Premium-Kollektionen
            </motion.p>
          </motion.div>

          {/* Category Grid - 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {loadingDepts ? (
              // Skeleton Loading
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="rounded-[20px] min-h-[160px] md:min-h-[180px]"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="p-5 md:p-6 space-y-4">
                    <div className="w-14 h-14 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
                    <div className="space-y-2">
                      <div className="h-5 w-24 rounded" style={{ background: 'rgba(255, 255, 255, 0.08)' }} />
                      <div className="h-4 w-16 rounded" style={{ background: 'rgba(255, 255, 255, 0.05)' }} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              departments.map((dept, index) => (
                <CategoryCard 
                  key={dept.id} 
                  department={dept} 
                  index={index}
                  productCount={departmentProductCounts[dept.id] || 0}
                />
              ))
            )}
          </div>

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10 md:mt-12"
          >
            <Link to={createPageUrl('Products')}>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="h-12 px-8 rounded-xl font-bold"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  Alle Produkte durchstöbern
                  <Sparkles className="w-4 h-4 ml-2" style={{ color: '#F2D27C' }} />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Category Products Sections */}
      {departments.map((department, index) => (
        <motion.div
          key={department.id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            delay: index * 0.2,
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <CategoryProductsSection
            department={department}
            products={departmentProducts[department.id] || []}
            loading={loadingDeptProducts[department.id] || false}
            onQuickView={(p) => {
              setQuickViewProduct(p);
              setIsQuickViewOpen(true);
            }}
            onRetry={() => {
              console.log(`🔄 Retrying load for department: ${department.name}`);
              loadDepartmentProducts();
            }}
          />
        </motion.div>
      ))}

      {/* Featured Products - Fresh Drops Slider */}
      <FreshDropsSection 
        products={products} 
        loading={loadingProducts}
        onQuickView={(p) => {
          setQuickViewProduct(p);
          setIsQuickViewOpen(true);
        }}
      />

      <ProductQuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* VIP Section - Ultra Premium */}
      <section className="py-32 relative overflow-hidden z-10">
        {/* Epic Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-purple-900/10 to-pink-900/10" />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ 
              scale: [1.3, 1, 1.3],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-purple-500/20 rounded-full blur-[120px]"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="relative backdrop-blur-2xl border-2 border-yellow-500/40 rounded-[3rem] p-10 md:p-16 text-center overflow-hidden"
          >
            {/* Animated Background Pattern */}
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-yellow-500/10 bg-[size:200%_200%]"
            />

            {/* Rotating Crown */}
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                y: [0, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-8 relative"
            >
              {/* Crown Glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 60px rgba(234, 179, 8, 0.5)',
                    '0 0 100px rgba(245, 158, 11, 0.7)',
                    '0 0 60px rgba(234, 179, 8, 0.5)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl blur-2xl"
              />
              <div className="relative w-28 h-28 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-6xl drop-shadow-2xl">👑</span>
              </div>
              
              {/* Orbiting Sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute -top-2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50" />
                <div className="absolute top-1/2 -right-2 w-3 h-3 bg-amber-400 rounded-full shadow-lg shadow-amber-500/50" />
                <div className="absolute -bottom-2 left-1/2 w-3 h-3 bg-yellow-300 rounded-full shadow-lg shadow-yellow-400/50" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
            >
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
                VIP CLUB
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-bold leading-relaxed"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Tritt der <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent font-black">Elite</span> bei und erlebe{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent font-black">Premium Shopping</span> ✨
            </motion.p>

            <div className="grid md:grid-cols-3 gap-5 mb-10">
              <motion.div 
                whileHover={{ y: -5, scale: 1.03 }}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-black text-lg mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Early Access</h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Erster Zugriff auf neue Produkte</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.03 }}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div className="text-4xl mb-4">💎</div>
                <h3 className="font-black text-lg mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Exklusive Deals</h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Spezielle VIP-Rabatte & Angebote</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.03 }}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="font-black text-lg mb-2" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Priority Support</h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Bevorzugter Kundenservice</p>
              </motion.div>
            </div>

            <Link to={createPageUrl('VIP')}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="relative h-16 px-12 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-zinc-900 font-black text-lg rounded-2xl shadow-2xl hover:shadow-yellow-500/60 transition-all overflow-hidden group"
              >
                {/* Animated Background */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundSize: '200% 100%' }}
                />
                
                {/* Shine Effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
                
                {/* Content */}
                <span className="relative flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    👑
                  </motion.span>
                  VIP werden
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}