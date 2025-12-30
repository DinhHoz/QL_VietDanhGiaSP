import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../utils/api";
import {
    Eye,
    CheckCircle,
    Truck,
    XCircle,
    Clock,
    Search,
    Filter,
    Package
} from "lucide-react";
import "./OrdersManagement.css";

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders/admin/all');
            if (res.data && res.data.success) {
                setOrders(res.data.orders || []);
            }
        } catch (err) {
            console.error('Lỗi fetch orders:', err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi tải dữ liệu',
                text: 'Không thể lấy danh sách đơn hàng'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    const handleUpdateStatus = async (orderId, newStatus) => {
        const confirmMsg = {
            shipping: "Xác nhận chuyển sang trạng thái Đang giao?",
            completed: "Xác nhận đơn hàng đã hoàn thành?",
            cancelled: "Cảnh báo: Bạn có chắc chắn muốn hủy đơn này?"
        };

        const result = await Swal.fire({
            title: 'Xác nhận thay đổi',
            text: confirmMsg[newStatus],
            icon: newStatus === 'cancelled' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy bỏ'
        });

        if (result.isConfirmed) {
            try {
                await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });

                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

                if (selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Trạng thái đơn hàng đã được cập nhật',
                    timer: 1500,
                    showConfirmButton: false
                });

            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Thất bại',
                    text: err.response?.data?.error || "Lỗi cập nhật trạng thái"
                });
            }
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { label: 'Chờ xử lý', icon: <Clock size={14} />, class: 'badge-pending' };
            case 'shipping': return { label: 'Đang giao', icon: <Truck size={14} />, class: 'badge-shipping' };
            case 'completed': return { label: 'Hoàn thành', icon: <CheckCircle size={14} />, class: 'badge-completed' };
            case 'cancelled': return { label: 'Đã hủy', icon: <XCircle size={14} />, class: 'badge-cancelled' };
            default: return { label: status, icon: null, class: 'badge-default' };
        }
    };

    const StatusBadge = ({ status }) => {
        const config = getStatusConfig(status);
        return (
            <span className={`status-badge ${config.class}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    const OrderDetailModal = () => {
        if (!selectedOrder) return null;
        return (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="header-left">
                            <h3>Đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
                            <p className="order-date">{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                        <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="info-grid">
                            <div className="info-card">
                                <h4><Filter size={16} /> Thông tin khách hàng</h4>
                                <div className="info-row">
                                    <span>Người nhận:</span> <strong>{selectedOrder.shippingInfo.fullName}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Số điện thoại:</span> <strong>{selectedOrder.shippingInfo.phone}</strong>
                                </div>
                                <div className="info-row">
                                    <span>Địa chỉ:</span> <span className="address-text">{selectedOrder.shippingInfo.address}</span>
                                </div>
                            </div>

                            <div className="info-card summary-card">
                                <h4><Package size={16} /> Tổng quan</h4>
                                <div className="info-row">
                                    <span>Trạng thái:</span> <StatusBadge status={selectedOrder.status} />
                                </div>
                                <div className="info-row total-row">
                                    <span>Tổng tiền:</span> <span className="total-price">{formatCurrency(selectedOrder.totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="items-section">
                            <h4>Danh sách sản phẩm ({selectedOrder.items.length})</h4>
                            <div className="items-table-wrapper">
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th className="text-center">Số lượng</th>
                                            <th className="text-right">Đơn giá</th>
                                            <th className="text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="product-cell">
                                                        <img
                                                            src={item.product?.images?.[0] ? `http://localhost:4000${item.product.images[0]}` : 'https://via.placeholder.com/50'}
                                                            alt=""
                                                            className="item-thumb"
                                                        />
                                                        <span className="item-name">{item.product?.name || "Sản phẩm đã xóa"}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">x{item.quantity}</td>
                                                <td className="text-right">{formatCurrency(item.price)}</td>
                                                <td className="text-right font-bold">{formatCurrency(item.quantity * item.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="action-group">
                            {selectedOrder.status === 'pending' && (
                                <>
                                    <button className="btn btn-danger" onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}>Hủy đơn</button>
                                    <button className="btn btn-primary" onClick={() => handleUpdateStatus(selectedOrder._id, 'shipping')}>Xác nhận giao hàng</button>
                                </>
                            )}
                            {selectedOrder.status === 'shipping' && (
                                <button className="btn btn-success" onClick={() => handleUpdateStatus(selectedOrder._id, 'completed')}>Hoàn thành đơn</button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="orders-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản Lý Đơn Hàng</h1>
                    <p className="page-subtitle">Theo dõi trạng thái và xử lý đơn đặt hàng</p>
                </div>
                <div className="header-actions">
                    <button className="btn-icon"><Search size={20} /></button>
                </div>
            </div>

            <div className="tabs-container">
                {[
                    { key: 'all', label: 'Tất cả' },
                    { key: 'pending', label: 'Chờ xử lý' },
                    { key: 'shipping', label: 'Đang giao' },
                    { key: 'completed', label: 'Hoàn thành' },
                    { key: 'cancelled', label: 'Đã hủy' }
                ].map(tab => {
                    const count = tab.key === 'all' ? orders.length : orders.filter(o => o.status === tab.key).length;
                    return (
                        <button
                            key={tab.key}
                            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            <span className="tab-count">{count}</span>
                        </button>
                    )
                })}
            </div>

            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} className="text-gray-300 mb-2" />
                        <p>Không tìm thấy đơn hàng nào trong mục này.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="main-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn hàng</th>
                                    <th>Khách hàng</th>
                                    <th>Ngày đặt</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th className="text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order._id} className="hover-row">
                                        <td className="font-mono">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td>
                                            <div className="user-info">
                                                <div>
                                                    <div className="font-medium">{order.shippingInfo?.fullName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-sub">{formatDate(order.createdAt)}</td>
                                        <td className="font-bold text-primary">{formatCurrency(order.totalPrice)}</td>
                                        <td><StatusBadge status={order.status} /></td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="action-btn-icon btn-view"
                                                    title="Xem chi tiết"
                                                    onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {order.status === 'pending' && (
                                                    <button className="action-btn-icon btn-ship" title="Giao hàng" onClick={() => handleUpdateStatus(order._id, 'shipping')}>
                                                        <Truck size={18} />
                                                    </button>
                                                )}

                                                {order.status === 'shipping' && (
                                                    <button className="action-btn-icon btn-done" title="Hoàn thành" onClick={() => handleUpdateStatus(order._id, 'completed')}>
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && <OrderDetailModal />}
        </div>
    );
};

export default OrdersManagement;