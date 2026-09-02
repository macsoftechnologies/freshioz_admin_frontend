import React from 'react';
import { Calendar, Leaf, ShoppingBag, Users, Store, ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
import './Dashboard.css';

const salesData = [
  { name: 'Aug 01', sales: 1200000 },
  { name: 'Aug 05', sales: 1600000 },
  { name: 'Aug 10', sales: 1500000 },
  { name: 'Aug 15', sales: 2500000 },
  { name: 'Aug 20', sales: 2400000 },
  { name: 'Aug 25', sales: 3200000 },
];

const categoryData = [
  { name: 'Vegetables', value: 112, color: '#1a4331' },
  { name: 'Fruits', value: 80, color: '#ffb300' },
  { name: 'Leafy Greens', value: 30, color: '#4caf50' },
  { name: 'Others', value: 26, color: '#ff9800' },
];

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header-bar">
        <div>
          <h2 className="dash-title">Dashboard</h2>
          <p className="dash-subtitle">Welcome back! Here's what's happening with Freshioz today.</p>
        </div>
        <button className="date-picker-btn">
          <Calendar size={18} />
          <span>Tue, 26 Aug 2025</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card border-green">
          <div className="stat-icon-wrap bg-green-light">
            <Leaf className="text-green" size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-title">Total Products</p>
            <h3 className="stat-value">248</h3>
            <p className="stat-change text-green">
              <ArrowUp size={14} /> 12% <span className="text-gray">vs last month</span>
            </p>
          </div>
          <div className="stat-bg-icon"><Leaf size={60} color="#e8f5e9" /></div>
        </div>
        <div className="stat-card border-orange">
          <div className="stat-icon-wrap bg-orange-light">
            <ShoppingBag className="text-orange" size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-title">Total Orders</p>
            <h3 className="stat-value">1,486</h3>
            <p className="stat-change text-green">
              <ArrowUp size={14} /> 8.5% <span className="text-gray">vs last month</span>
            </p>
          </div>
          <div className="stat-bg-icon"><ShoppingBag size={60} color="#fff3e0" /></div>
        </div>
        <div className="stat-card border-teal">
          <div className="stat-icon-wrap bg-teal-light">
            <Users className="text-teal" size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-title">Total Customers</p>
            <h3 className="stat-value">586</h3>
            <p className="stat-change text-green">
              <ArrowUp size={14} /> 14% <span className="text-gray">vs last month</span>
            </p>
          </div>
          <div className="stat-bg-icon"><Users size={60} color="#e0f2f1" /></div>
        </div>
        <div className="stat-card border-red">
          <div className="stat-icon-wrap bg-red-light">
            <Store className="text-red" size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-title">Total Suppliers</p>
            <h3 className="stat-value">124</h3>
            <p className="stat-change text-green">
              <ArrowUp size={14} /> 6% <span className="text-gray">vs last month</span>
            </p>
          </div>
          <div className="stat-bg-icon"><Store size={60} color="#ffebee" /></div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Sales Overview Card */}
        <div className="card card-sales">
          <div className="card-header">
            <h3 className="card-title"><Leaf size={18} className="text-green" /> Sales Overview</h3>
            <select className="filter-select">
              <option>This Month</option>
            </select>
          </div>
          <div className="sales-metric">
            <h2>₹ 12,48,500</h2>
            <span className="badge-green"><ArrowUp size={12}/> 18.4% from last month</span>
          </div>
          <p className="sales-sub">Total Sales</p>
          <div className="chart-container" style={{ flex: 1, minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} tickFormatter={(value) => `${value / 100000}L`} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="sales" stroke="#4caf50" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" dot={{r: 4, fill: '#4caf50', strokeWidth: 2, stroke: 'white'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Category Summary Card */}
        <div className="card card-category">
          <div className="card-header">
            <h3 className="card-title"><Leaf size={18} className="text-green" /> Category Summary</h3>
          </div>
          <div className="pie-container">
            <div className="pie-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                        value="248"
                        position="centerBottom"
                        dy={-10}
                        style={{ fontSize: '24px', fontWeight: 'bold', fill: '#1a1a1a' }}
                    />
                    <Label
                        value="Total Products"
                        position="centerTop"
                        dy={10}
                        style={{ fontSize: '10px', fill: '#888' }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend">
              {categoryData.map((item, idx) => (
                <div key={idx} className="legend-item">
                  <div className="legend-label">
                    <span className="dot" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </div>
                  <div className="legend-value">
                    {Math.round((item.value/248)*100)}% <span className="legend-count">({item.value})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Card */}
        <div className="card card-orders">
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
            <a href="#" className="view-all">View All</a>
          </div>
          <div className="orders-list">
            {[
              { id: '#ORD-10058', title: 'Fresh Vegetables (50kg)', vendor: 'Sharma Traders', status: 'Delivered', time: '2 hrs ago', statusColor: 'green', emoji: '🥬' },
              { id: '#ORD-10057', title: 'Fresh Fruits (30kg)', vendor: 'Green Mart', status: 'Processing', time: '4 hrs ago', statusColor: 'orange', emoji: '🍌' },
              { id: '#ORD-10056', title: 'Onions (100kg)', vendor: 'RK Wholesalers', status: 'Shipped', time: '6 hrs ago', statusColor: 'blue', emoji: '🧅' },
              { id: '#ORD-10055', title: 'Tomatoes (60kg)', vendor: 'Fresh Basket', status: 'Delivered', time: '1 day ago', statusColor: 'green', emoji: '🍅' },
            ].map((order, i) => (
              <div className="order-item" key={i}>
                <div className="order-img-placeholder emoji-lg">{order.emoji}</div>
                <div className="order-details">
                  <div className="order-top">
                    <span className="order-id">{order.id}</span>
                    <span className={`badge-light-${order.statusColor}`}>{order.status}</span>
                  </div>
                  <p className="order-title">{order.title}</p>
                  <div className="order-bottom">
                    <span className="order-vendor">{order.vendor}</span>
                    <span className="order-time">{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Activity Card */}
        <div className="card card-activity">
          <div className="card-header">
            <h3 className="card-title"><Leaf size={18} className="text-green" /> Today's Activity</h3>
            <a href="#" className="view-all">View All</a>
          </div>
          <div className="activity-list">
             <div className="activity-item">
               <div className="activity-icon bg-green-light"><ShoppingBag size={14} className="text-green" /></div>
               <div className="activity-text">
                 <p>New order received <strong>#ORD-10058</strong></p>
                 <span>2 hours ago</span>
               </div>
             </div>
             <div className="activity-item">
               <div className="activity-icon bg-orange-light"><Store size={14} className="text-orange" /></div>
               <div className="activity-text">
                 <p>Stock updated - Tomatoes</p>
                 <span>4 hours ago</span>
               </div>
             </div>
             <div className="activity-item">
               <div className="activity-icon bg-teal-light"><Users size={14} className="text-teal" /></div>
               <div className="activity-text">
                 <p>New supplier added</p>
                 <span>6 hours ago</span>
               </div>
             </div>
          </div>
        </div>

        {/* Low Stock Products Card */}
        <div className="card card-low-stock">
          <div className="card-header">
            <h3 className="card-title"><Leaf size={18} className="text-green" /> Low Stock Products</h3>
            <a href="#" className="view-all">View All</a>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div className="prod-cell"><span className="emoji-icon">🍅</span> Tomato</div></td>
                  <td><span className="badge-light-green">Vegetables</span></td>
                  <td>25 kg</td>
                  <td>50 kg</td>
                  <td><span className="badge-light-red">Low Stock</span></td>
                  <td><button className="btn-restock">Restock</button></td>
                </tr>
                <tr>
                  <td><div className="prod-cell"><span className="emoji-icon">🧅</span> Onion</div></td>
                  <td><span className="badge-light-green">Vegetables</span></td>
                  <td>40 kg</td>
                  <td>100 kg</td>
                  <td><span className="badge-light-red">Low Stock</span></td>
                  <td><button className="btn-restock">Restock</button></td>
                </tr>
                <tr>
                  <td><div className="prod-cell"><span className="emoji-icon">🍌</span> Banana</div></td>
                  <td><span className="badge-light-orange">Fruits</span></td>
                  <td>30 kg</td>
                  <td>80 kg</td>
                  <td><span className="badge-light-red">Low Stock</span></td>
                  <td><button className="btn-restock">Restock</button></td>
                </tr>
                <tr>
                  <td><div className="prod-cell"><span className="emoji-icon">🥔</span> Potato</div></td>
                  <td><span className="badge-light-green">Vegetables</span></td>
                  <td>60 kg</td>
                  <td>100 kg</td>
                  <td><span className="badge-light-green">Normal</span></td>
                  <td><button className="btn-restock">Restock</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;