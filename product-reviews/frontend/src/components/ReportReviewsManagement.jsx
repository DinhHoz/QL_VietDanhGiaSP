import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../utils/api";
import {
    Flag, CheckCircle, XCircle, AlertTriangle,
    EyeOff, Eye, User, Gavel, Calendar, Star
} from "lucide-react";
import "./ReportReviewsManagement.css";

const ReportReviewsManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');

    // Fetch API
    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/admin/reviews?status=${activeTab}`);
            if (res.data && res.data.success) {
                setReports(res.data.reports || []);
            }
        } catch (err) {
            console.error("Fetch reports error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [activeTab]);

    // Xử lý hành động
    const handleAction = async (reportId, action) => {
        const actionsConfig = {
            reject: {
                title: 'Bác bỏ báo cáo?',
                text: "Review này hợp lệ? Trạng thái sẽ chuyển thành 'Rejected'.",
                confirmBtn: 'Giữ Review',
                confirmColor: '#6b7280',
                method: 'patch',
                url: `/reports/admin/reviews/${reportId}/reject`
            },
            hide: {
                title: 'Ẩn Review?',
                text: "Review sẽ bị ẩn khỏi sản phẩm (Soft Delete).",
                confirmBtn: 'Ẩn ngay',
                confirmColor: '#f59e0b',
                method: 'patch',
                url: `/reports/admin/reviews/${reportId}/hide`
            },
            restore: {
                title: 'Hiện lại Review?',
                text: "Review sẽ xuất hiện trở lại trên trang sản phẩm.",
                confirmBtn: 'Hiện lại',
                confirmColor: '#10b981',
                method: 'patch',
                url: `/reports/admin/reviews/${reportId}/restore`
            },
            warn: {
                title: 'Cảnh cáo User?',
                text: "Tăng số lần cảnh cáo cho tài khoản này.",
                confirmBtn: 'Cảnh cáo',
                confirmColor: '#d97706',
                method: 'post',
                url: `/reports/admin/reviews/warn`,
                data: { reportId }
            }
        };

        const config = actionsConfig[action];

        const result = await Swal.fire({
            title: config.title,
            text: config.text,
            icon: action === 'warn' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: config.confirmColor,
            cancelButtonColor: '#e5e7eb',
            confirmButtonText: config.confirmBtn,
            cancelButtonText: 'Hủy',
            customClass: { cancelButton: 'swal-cancel-btn-custom' }
        });

        if (result.isConfirmed) {
            try {
                let response;
                if (config.method === 'patch') response = await api.patch(config.url);
                else if (config.method === 'post') response = await api.post(config.url, config.data);

                if (response.data && response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công',
                        text: response.data.message,
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchReports();
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Lỗi', err.response?.data?.error || 'Có lỗi xảy ra', 'error');
            }
        }
    };

    const formatDate = (date) => new Date(date).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const getReasonLabel = (reason) => {
        const map = {
            spam: 'Spam / Quảng cáo',
            abusive: 'Ngôn từ đả kích',
            not_related: 'Sai sự thật',
            sensitive_image: 'Hình ảnh nhạy cảm',
            other: 'Khác'
        };
        return map[reason] || reason;
    };

    return (
        <div className="reports-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản Lý Báo Cáo</h1>
                    <p className="page-subtitle">Kiểm duyệt các đánh giá vi phạm tiêu chuẩn cộng đồng</p>
                </div>
                {activeTab === 'pending' && (
                    <div className="header-stats">
                        <span className="stat-count">{reports.length}</span>
                        <span className="stat-label">Đang chờ</span>
                    </div>
                )}
            </div>

            <div className="tabs-container">
                {[
                    { key: 'pending', label: 'Chờ xử lý', icon: <AlertTriangle size={16} /> },
                    { key: 'resolved', label: 'Đã giải quyết', icon: <CheckCircle size={16} /> },
                    { key: 'rejected', label: 'Đã từ chối', icon: <XCircle size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="content-area">
                {loading ? (
                    <div className="loading-state"><div className="spinner"></div></div>
                ) : reports.length === 0 ? (
                    <div className="empty-state">
                        <Flag size={64} className="empty-icon" />
                        <p>Không có báo cáo nào ở trạng thái này.</p>
                    </div>
                ) : (
                    <div className="reports-grid">
                        {reports.map(report => (
                            <div key={report._id} className="report-card">
                                {/* Header */}
                                <div className="card-header">
                                    <div className="reporter-meta">
                                        <div className="avatar-placeholder">
                                            {report.reportedBy?.name?.charAt(0) || <User size={16} />}
                                        </div>
                                        <div>
                                            <div className="reporter-name">
                                                {report.reportedBy?.name || "Người dùng ẩn"}
                                                <span className="report-action-text"> đã báo cáo</span>
                                            </div>
                                            <div className="report-time">
                                                <Calendar size={12} /> {formatDate(report.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`reason-tag reason-${report.reason}`}>
                                        {getReasonLabel(report.reason)}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="card-body">
                                    {report.description && (
                                        <div className="report-description">
                                            <strong>Lời nhắn: </strong> "{report.description}"
                                        </div>
                                    )}

                                    <div className="review-context-box">
                                        <div className="review-context-header">
                                            <div className="violator-info">
                                                <User size={14} />
                                                <span className="violator-label">Người bị báo cáo: </span>
                                                <strong className="violator-name">
                                                    {report.reportedUser?.name || report.reviewId?.userName || "N/A"}
                                                </strong>
                                                <span className="violator-email">({report.reportedUser?.email})</span>
                                            </div>
                                            {report.reviewId && (
                                                <div className="rating-display">
                                                    {report.reviewId.rating} <Star size={12} fill="#fbbf24" stroke="none" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="review-content-scroll">
                                            {report.reviewId ? (
                                                <>
                                                    <p className="review-text-content">"{report.reviewId.comment}"</p>
                                                    {report.reviewId.isDeleted && (
                                                        <div className="soft-deleted-badge">
                                                            <EyeOff size={12} /> Đã bị ẩn
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="review-deleted-perm">Review gốc đã bị xóa vĩnh viễn.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Area */}
                                <div className="card-actions">
                                    
                                    {/* 1. Nhóm nút dành cho tab CHỜ XỬ LÝ (PENDING) */}
                                    {report.status === 'pending' ? (
                                        <>
                                            <button
                                                className="btn-action btn-reject"
                                                onClick={() => handleAction(report._id, 'reject')}
                                                title="Bác bỏ (Không vi phạm)"
                                            >
                                                Bỏ qua
                                            </button>

                                            <div className="action-group-right">
                                                <button
                                                    className="btn-action btn-warn"
                                                    onClick={() => handleAction(report._id, 'warn')}
                                                    title="Cảnh cáo người dùng này"
                                                >
                                                    <Gavel size={16} /> Cảnh cáo
                                                </button>

                                                {/* Chỉ hiện nút ẨN nếu review chưa bị xóa */}
                                                {report.reviewId && !report.reviewId.isDeleted && (
                                                    <button
                                                        className="btn-action btn-hide"
                                                        onClick={() => handleAction(report._id, 'hide')}
                                                        title="Ẩn review khỏi trang chủ"
                                                    >
                                                        <EyeOff size={16} /> Ẩn
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        // 2. Nhóm nút dành cho tab ĐÃ GIẢI QUYẾT (RESOLVED)
                                        // Chỉ hiện nút "Hiện lại" nếu review đang bị ẩn
                                        <>
                                            <span></span> {/* Spacer */}
                                            <div className="action-group-right">
                                                {report.status === 'resolved' && report.reviewId && report.reviewId.isDeleted && (
                                                    <button
                                                        className="btn-action btn-restore"
                                                        onClick={() => handleAction(report._id, 'restore')}
                                                        title="Hiện lại review"
                                                        style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                    >
                                                        <Eye size={16} /> Hiện lại
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Footer Info */}
                                {report.status !== 'pending' && (
                                    <div className={`status-footer status-${report.status}`}>
                                        {report.status === 'resolved'
                                            ? <><CheckCircle size={16} /> Đã xử lý bởi {report.handledBy?.name}</>
                                            : <><XCircle size={16} /> Đã từ chối bởi {report.handledBy?.name}</>
                                        }
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportReviewsManagement;