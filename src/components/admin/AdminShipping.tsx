import React, { useState } from 'react';
import {
  Truck,
  Search,
  Package,
  Calendar,
  ExternalLink,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  MapPin,
  Scale,
  Maximize2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Send,
  Ban,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ShipmentRecord, ShipmentStatus, Order, ShiprocketCourierRate } from '../../types';

export const AdminShipping: React.FC = () => {
  const {
    orders,
    shipments,
    storeSettings,
    createShipmentForOrder,
    generateAwbForShipment,
    schedulePickupForShipment,
    generateLabelForShipment,
    cancelShipment,
    refreshShipmentTracking,
    checkShippingRates,
    showToast,
  } = useApp();

  // Filters & State
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord | null>(null);

  // Modals
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedOrderForBooking, setSelectedOrderForBooking] = useState<Order | null>(null);
  const [selectedShipmentForPickup, setSelectedShipmentForPickup] = useState<ShipmentRecord | null>(null);

  // Rate calculator state
  const [rateCalcPincode, setRateCalcPincode] = useState('410501');
  const [rateCalcWeight, setRateCalcWeight] = useState(1.5);
  const [rateCalcLength, setRateCalcLength] = useState(25);
  const [rateCalcBreadth, setRateCalcBreadth] = useState(20);
  const [rateCalcHeight, setRateCalcHeight] = useState(15);
  const [isCalculatingRates, setIsCalculatingRates] = useState(false);
  const [calculatedRates, setCalculatedRates] = useState<ShiprocketCourierRate[]>([]);

  // Booking state
  const [bookingWeight, setBookingWeight] = useState(1.5);
  const [bookingLength, setBookingLength] = useState(25);
  const [bookingBreadth, setBookingBreadth] = useState(20);
  const [bookingHeight, setBookingHeight] = useState(15);
  const [bookingCourierId, setBookingCourierId] = useState<number | undefined>(undefined);
  const [bookingShippingCharge, setBookingShippingCharge] = useState(0);
  const [isBooking, setIsBooking] = useState(false);

  // Pickup date state
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isScheduling, setIsScheduling] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // All valid orders that need shipping or have shipments
  const ordersWithoutShipment = orders.filter(
    (o) =>
      (o.status === 'Confirmed' || o.status === 'Processing' || o.status === 'Pending') &&
      !shipments.some((s) => s.internalOrderId === o.id && s.shipmentStatus !== 'Cancelled')
  );

  // Tabs matching Section 15
  const tabs = [
    { id: 'ALL', label: 'All Shipments', count: shipments.length },
    { id: 'NOT_BOOKED', label: 'Not Booked', count: ordersWithoutShipment.length },
    { id: 'BOOKED', label: 'Booked', count: shipments.filter((s) => s.shipmentStatus === 'Shipment Booked').length },
    {
      id: 'PICKUP_PENDING',
      label: 'Pickup Pending',
      count: shipments.filter((s) => s.shipmentStatus === 'Pickup Scheduled' || s.pickupStatus === 'Pending').length,
    },
    { id: 'IN_TRANSIT', label: 'In Transit', count: shipments.filter((s) => s.shipmentStatus === 'In Transit').length },
    { id: 'DELIVERED', label: 'Delivered', count: shipments.filter((s) => s.shipmentStatus === 'Delivered').length },
    { id: 'CANCELLED', label: 'Cancelled', count: shipments.filter((s) => s.shipmentStatus === 'Cancelled').length },
    { id: 'RTO', label: 'RTO', count: shipments.filter((s) => s.shipmentStatus === 'RTO').length },
  ];

  // Filtered list
  const filteredShipments = shipments.filter((s) => {
    if (activeTab === 'BOOKED' && s.shipmentStatus !== 'Shipment Booked') return false;
    if (
      activeTab === 'PICKUP_PENDING' &&
      !(s.shipmentStatus === 'Pickup Scheduled' || s.pickupStatus === 'Pending')
    )
      return false;
    if (activeTab === 'IN_TRANSIT' && s.shipmentStatus !== 'In Transit') return false;
    if (activeTab === 'DELIVERED' && s.shipmentStatus !== 'Delivered') return false;
    if (activeTab === 'CANCELLED' && s.shipmentStatus !== 'Cancelled') return false;
    if (activeTab === 'RTO' && s.shipmentStatus !== 'RTO') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = s.orderNumber?.toLowerCase().includes(q);
      const matchAwb = s.awbCode?.toLowerCase().includes(q);
      const matchCourier = s.courierName?.toLowerCase().includes(q);
      const matchPin = s.deliveryPincode?.includes(q);
      if (!matchNum && !matchAwb && !matchCourier && !matchPin) return false;
    }
    return true;
  });

  // Action: Check Rates
  const handleCheckRates = async (deliveryPincode: string) => {
    setRateCalcPincode(deliveryPincode);
    setIsRateModalOpen(true);
    setIsCalculatingRates(true);
    try {
      const rates = await checkShippingRates(deliveryPincode, rateCalcWeight, {
        length: rateCalcLength,
        breadth: rateCalcBreadth,
        height: rateCalcHeight,
      });
      setCalculatedRates(rates);
    } catch {
      // handled in context
    } finally {
      setIsCalculatingRates(false);
    }
  };

  // Action: Open Create Shipment Modal for unbooked order
  const handleOpenBookModal = (order: Order) => {
    setSelectedOrderForBooking(order);
    setBookingWeight(1.5);
    setBookingLength(25);
    setBookingBreadth(20);
    setBookingHeight(15);
    setBookingShippingCharge(order.deliveryCharge || 0);
    setIsBookModalOpen(true);
  };

  // Action: Submit Create Shipment
  const handleConfirmCreateShipment = async () => {
    if (!selectedOrderForBooking) return;
    setIsBooking(true);
    try {
      await createShipmentForOrder(selectedOrderForBooking.id, {
        weight: bookingWeight,
        dimensions: {
          length: bookingLength,
          breadth: bookingBreadth,
          height: bookingHeight,
        },
        courierId: bookingCourierId,
        shippingCharge: bookingShippingCharge,
      });
      setIsBookModalOpen(false);
      setSelectedOrderForBooking(null);
    } finally {
      setIsBooking(false);
    }
  };

  // Action: Generate AWB
  const handleGenerateAwb = async (shipment: ShipmentRecord) => {
    setActionLoadingId(shipment.id);
    try {
      await generateAwbForShipment(shipment.id, shipment.courierId);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Open Pickup Modal
  const handleOpenPickupModal = (shipment: ShipmentRecord) => {
    setSelectedShipmentForPickup(shipment);
    setIsPickupModalOpen(true);
  };

  // Action: Submit Schedule Pickup
  const handleConfirmPickup = async () => {
    if (!selectedShipmentForPickup) return;
    setIsScheduling(true);
    try {
      await schedulePickupForShipment(selectedShipmentForPickup.id, pickupDate);
      setIsPickupModalOpen(false);
      setSelectedShipmentForPickup(null);
    } finally {
      setIsScheduling(false);
    }
  };

  // Action: Download Label
  const handleDownloadLabel = async (shipment: ShipmentRecord) => {
    if (shipment.labelUrl) {
      window.open(shipment.labelUrl, '_blank');
      return;
    }
    setActionLoadingId(shipment.id);
    try {
      const url = await generateLabelForShipment(shipment.id);
      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Refresh Tracking Status
  const handleRefreshStatus = async (shipment: ShipmentRecord) => {
    if (!shipment.awbCode) {
      showToast('AWB must be generated before refreshing live tracking status', 'error');
      return;
    }
    setActionLoadingId(shipment.id);
    try {
      await refreshShipmentTracking(shipment.awbCode, shipment.id);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Cancel Shipment
  const handleCancelShipment = async (shipment: ShipmentRecord) => {
    if (confirm(`Are you sure you want to cancel shipment for Order ${shipment.orderNumber}?`)) {
      setActionLoadingId(shipment.id);
      try {
        await cancelShipment(shipment.id);
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Shipment Booked':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pickup Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Picked Up':
      case 'In Transit':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Out for Delivery':
        return 'bg-orange-50 text-[#FF6A00] border-orange-200';
      case 'Delivered':
        return 'bg-green-50 text-[#168A45] border-green-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'RTO':
      case 'Undelivered':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#FF6A00]" />
            <span>Shiprocket Shipping Management</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Realtime courier integration: check rates, book shipments, generate AWBs, and schedule pickups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCheckRates('410501')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-xs hover:bg-gray-50"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Check Shipping Rates</span>
          </button>
        </div>
      </div>

      {/* Verified Pickup Depot Banner (Section 17: separate from customer store location) */}
      <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900">
              Verified Shiprocket Pickup Location:{' '}
              <span className="text-[#FF6A00]">{storeSettings.shiprocketPickup?.nickname || 'Atharv Electrical Depot'}</span>
            </p>
            <p className="text-gray-500 text-[11px]">
              Chakan Showroom Depot (PIN: {storeSettings.shiprocketPickup?.pincode || '410501'}) · Customer Showroom: Manik Chowk, Chakan
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 font-bold text-[11px] text-[#168A45] bg-green-50 px-2.5 py-1 rounded-lg border border-green-200 shrink-0">
          <CheckCircle2 className="w-3 h-3" />
          <span>API Connected</span>
        </span>
      </div>

      {/* Tabs matching Section 15 */}
      <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID, AWB Code, Courier or Pincode..."
          className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#FF6A00]"
        />
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Table: NOT BOOKED ORDERS VIEW */}
      {activeTab === 'NOT_BOOKED' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
              Confirmed Orders Awaiting Shiprocket Booking ({ordersWithoutShipment.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivery Pincode</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordersWithoutShipment.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      All confirmed orders are booked with couriers! No pending orders.
                    </td>
                  </tr>
                ) : (
                  ordersWithoutShipment.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{ord.customerName}</p>
                        <p className="text-[11px] text-gray-400">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                        {ord.deliveryAddress.pincode} ({ord.deliveryAddress.city})
                      </td>
                      <td className="py-3 px-4">{ord.items.length} product(s)</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentStatus === 'Paid'
                              ? 'bg-green-100 text-[#168A45]'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {ord.paymentStatus} ({ord.paymentMethod})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCheckRates(ord.deliveryAddress.pincode)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-[11px]"
                          >
                            Check Rates
                          </button>
                          <button
                            onClick={() => handleOpenBookModal(ord)}
                            className="px-3 py-1.5 rounded-lg bg-atharvay-gradient text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Create Shipment</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Table: BOOKED SHIPMENTS VIEW (Section 15) */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Courier</th>
                  <th className="py-3 px-4">AWB Code</th>
                  <th className="py-3 px-4">Shipping Charge</th>
                  <th className="py-3 px-4">Shipment Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 space-y-2">
                      <Truck className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="font-bold text-gray-700">No shipments found in this view</p>
                      <p className="text-[11px] text-gray-400">
                        Switch to "Not Booked" to create shipments for new orders.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => {
                    const linkedOrder = orders.find((o) => o.id === s.internalOrderId);
                    const isLoading = actionLoadingId === s.id;

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Order ID */}
                        <td className="py-3 px-4 font-mono font-bold text-gray-900">
                          {s.orderNumber}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">
                            {linkedOrder?.customerName || 'Customer'}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            PIN: {s.deliveryPincode}
                          </p>
                        </td>

                        {/* Courier */}
                        <td className="py-3 px-4">
                          {s.courierName ? (
                            <span className="font-bold text-gray-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
                              {s.courierName}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Not Assigned</span>
                          )}
                        </td>

                        {/* AWB Code */}
                        <td className="py-3 px-4">
                          {s.awbCode ? (
                            <a
                              href={s.trackingUrl || `https://shiprocket.co/tracking/${s.awbCode}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
                              title="Click to track on Shiprocket"
                            >
                              <span>{s.awbCode}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-amber-600 text-[11px] font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              Pending AWB
                            </span>
                          )}
                        </td>

                        {/* Shipping Charge */}
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          ₹{s.shippingCharge || 0}
                        </td>

                        {/* Shipment Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                              s.shipmentStatus
                            )}`}
                          >
                            {s.shipmentStatus}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                          {new Date(s.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>

                        {/* Actions (Section 15: Hide actions that are invalid for current state) */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <button
                              onClick={() => setSelectedShipment(s)}
                              className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              title="View Details"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Generate AWB (Only if not generated & not cancelled) */}
                            {!s.awbCode && s.shipmentStatus !== 'Cancelled' && (
                              <button
                                onClick={() => handleGenerateAwb(s)}
                                disabled={isLoading}
                                className="px-2 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] disabled:opacity-50 flex items-center gap-1"
                                title="Generate AWB"
                              >
                                {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                                <span>Generate AWB</span>
                              </button>
                            )}

                            {/* Schedule Pickup (Only after AWB generated, before picked up, not cancelled) */}
                            {s.awbCode &&
                              s.pickupStatus === 'Pending' &&
                              s.shipmentStatus !== 'Cancelled' &&
                              s.shipmentStatus !== 'Delivered' && (
                                <button
                                  onClick={() => handleOpenPickupModal(s)}
                                  disabled={isLoading}
                                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] disabled:opacity-50 flex items-center gap-1"
                                  title="Schedule Pickup"
                                >
                                  <Calendar className="w-3 h-3" />
                                  <span>Schedule Pickup</span>
                                </button>
                              )}

                            {/* Download Label (Only after AWB generated) */}
                            {s.awbCode && s.shipmentStatus !== 'Cancelled' && (
                              <button
                                onClick={() => handleDownloadLabel(s)}
                                disabled={isLoading}
                                className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] disabled:opacity-50 flex items-center gap-1"
                                title="Download Shipping Label"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Label</span>
                              </button>
                            )}

                            {/* Refresh Status (Only after AWB generated) */}
                            {s.awbCode && s.shipmentStatus !== 'Cancelled' && s.shipmentStatus !== 'Delivered' && (
                              <button
                                onClick={() => handleRefreshStatus(s)}
                                disabled={isLoading}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                title="Refresh Live Status"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF6A00]' : ''}`} />
                              </button>
                            )}

                            {/* Cancel Shipment (Eligible if not picked up or delivered) */}
                            {s.shipmentStatus !== 'Cancelled' &&
                              s.shipmentStatus !== 'Delivered' &&
                              s.shipmentStatus !== 'In Transit' && (
                                <button
                                  onClick={() => handleCancelShipment(s)}
                                  disabled={isLoading}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  title="Cancel Shipment"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: RATE CALCULATOR (Section 10) */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#FF6A00]" />
                <span>Shiprocket Courier Rate Calculator</span>
              </h3>
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pickup Pincode</label>
                <input
                  type="text"
                  disabled
                  value={storeSettings.shiprocketPickup?.pincode || '410501'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-mono font-bold"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Chakan Showroom Depot</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Delivery Pincode *</label>
                <input
                  type="text"
                  required
                  value={rateCalcPincode}
                  onChange={(e) => setRateCalcPincode(e.target.value)}
                  placeholder="e.g. 411001"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Actual Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={rateCalcWeight}
                  onChange={(e) => setRateCalcWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Dimensions (L × B × H cm)</label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    value={rateCalcLength}
                    onChange={(e) => setRateCalcLength(Number(e.target.value))}
                    placeholder="L"
                    className="w-full px-2 py-2 rounded-xl border text-center"
                  />
                  <input
                    type="number"
                    value={rateCalcBreadth}
                    onChange={(e) => setRateCalcBreadth(Number(e.target.value))}
                    placeholder="B"
                    className="w-full px-2 py-2 rounded-xl border text-center"
                  />
                  <input
                    type="number"
                    value={rateCalcHeight}
                    onChange={(e) => setRateCalcHeight(Number(e.target.value))}
                    placeholder="H"
                    className="w-full px-2 py-2 rounded-xl border text-center"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCheckRates(rateCalcPincode)}
              disabled={isCalculatingRates}
              className="w-full py-2.5 rounded-xl bg-atharvay-gradient text-white font-bold shadow-xs hover:shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalculatingRates ? 'animate-spin' : ''}`} />
              <span>{isCalculatingRates ? 'Fetching Live Rates...' : 'Calculate Courier Rates'}</span>
            </button>

            {/* Rates Table */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="font-bold text-gray-700">Available Couriers ({calculatedRates.length})</h4>
              {calculatedRates.length === 0 && !isCalculatingRates ? (
                <p className="text-gray-400 italic text-center py-4">
                  Enter pincode & weight to view courier rate comparison.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {calculatedRates.map((c) => (
                    <div key={c.courier_company_id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{c.courier_name}</p>
                        <p className="text-[11px] text-gray-400">
                          ETD: {c.etd} · Rating: {c.rating}★
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-base text-[#168A45]">₹{c.rate}</span>
                        <span className="block text-[10px] text-gray-400">
                          {c.cod ? 'COD Available' : 'Prepaid Only'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE SHIPMENT (Section 11) */}
      {isBookModalOpen && selectedOrderForBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Create Shipment for {selectedOrderForBooking.orderNumber}
                </h3>
                <p className="text-gray-500 text-[11px]">
                  Fulfilling Customer: {selectedOrderForBooking.customerName}
                </p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address Summary */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">Delivery Address</span>
              <p className="font-semibold text-gray-900">
                {selectedOrderForBooking.deliveryAddress.houseBuilding}, {selectedOrderForBooking.deliveryAddress.street}
              </p>
              <p className="text-gray-600">
                {selectedOrderForBooking.deliveryAddress.area}, {selectedOrderForBooking.deliveryAddress.city} —{' '}
                <strong>{selectedOrderForBooking.deliveryAddress.pincode}</strong>
              </p>
            </div>

            {/* Package Dimensions & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Package Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={bookingWeight}
                  onChange={(e) => setBookingWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Shipping Fee (₹)</label>
                <input
                  type="number"
                  value={bookingShippingCharge}
                  onChange={(e) => setBookingShippingCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  Package Dimensions (Length × Breadth × Height in cm) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={bookingLength}
                    onChange={(e) => setBookingLength(Number(e.target.value))}
                    placeholder="L"
                    className="w-full px-3 py-2 rounded-xl border text-center font-bold"
                  />
                  <input
                    type="number"
                    value={bookingBreadth}
                    onChange={(e) => setBookingBreadth(Number(e.target.value))}
                    placeholder="B"
                    className="w-full px-3 py-2 rounded-xl border text-center font-bold"
                  />
                  <input
                    type="number"
                    value={bookingHeight}
                    onChange={(e) => setBookingHeight(Number(e.target.value))}
                    placeholder="H"
                    className="w-full px-3 py-2 rounded-xl border text-center font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreateShipment}
                disabled={isBooking}
                className="px-6 py-2 rounded-xl bg-atharvay-gradient text-white font-bold shadow-xs hover:shadow flex items-center gap-2 disabled:opacity-50"
              >
                {isBooking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                <span>{isBooking ? 'Registering with Shiprocket...' : 'Confirm Shipment Booking'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE PICKUP (Section 12) */}
      {isPickupModalOpen && selectedShipmentForPickup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF6A00]" />
                <span>Schedule Courier Pickup</span>
              </h3>
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <p>
                Order: <strong>{selectedShipmentForPickup.orderNumber}</strong>
              </p>
              <p>
                AWB Code: <strong className="font-mono text-[#FF6A00]">{selectedShipmentForPickup.awbCode}</strong>
              </p>
              <p>
                Assigned Courier: <strong>{selectedShipmentForPickup.courierName || 'Delhivery Surface'}</strong>
              </p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Select Pickup Date *</label>
              <input
                type="date"
                required
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6A00] font-bold"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Courier representative will visit Atharv Electrical Chakan Depot on this date.
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsPickupModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPickup}
                disabled={isScheduling}
                className="px-6 py-2 rounded-xl bg-atharvay-gradient text-white font-bold shadow-xs hover:shadow flex items-center gap-2 disabled:opacity-50"
              >
                {isScheduling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                <span>{isScheduling ? 'Scheduling...' : 'Request Pickup'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SHIPMENT DETAILS DRAWER / MODAL (Section 13) */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#FF6A00]" />
                  <span>Shipment {selectedShipment.orderNumber}</span>
                </h3>
                <span className="text-[11px] text-gray-400 font-mono">
                  Shipment ID: {selectedShipment.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Identifiers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Status</span>
                <p className="font-bold text-gray-900 mt-0.5">{selectedShipment.shipmentStatus}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">AWB Code</span>
                <p className="font-bold font-mono text-[#FF6A00] mt-0.5">
                  {selectedShipment.awbCode || 'Pending'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Courier</span>
                <p className="font-bold text-gray-900 mt-0.5">
                  {selectedShipment.courierName || 'Unassigned'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Package Weight</span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {selectedShipment.packageWeight} kg
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Dimensions</span>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {selectedShipment.packageDimensions.length} × {selectedShipment.packageDimensions.breadth} ×{' '}
                  {selectedShipment.packageDimensions.height} cm
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Pickup Status</span>
                <p className="font-bold text-gray-900 mt-0.5">{selectedShipment.pickupStatus}</p>
              </div>
            </div>

            {/* Pickup & Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100">
                <span className="text-[10px] font-bold uppercase text-[#FF6A00] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Pickup Location</span>
                </span>
                <p className="font-bold text-gray-900 mt-1">{selectedShipment.pickupLocation}</p>
                <p className="text-[11px] text-gray-500 font-mono">PIN: {selectedShipment.pickupPincode}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Delivery Destination</span>
                </span>
                <p className="font-bold text-gray-900 mt-1">Customer Delivery Address</p>
                <p className="text-[11px] text-gray-500 font-mono">PIN: {selectedShipment.deliveryPincode}</p>
              </div>
            </div>

            {/* Tracking Link */}
            {selectedShipment.awbCode && (
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Public Tracking Link</span>
                  <p className="font-mono text-gray-700 text-[11px] truncate max-w-xs">
                    https://shiprocket.co/tracking/{selectedShipment.awbCode}
                  </p>
                </div>
                <a
                  href={`https://shiprocket.co/tracking/${selectedShipment.awbCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gray-900 text-white font-bold text-[11px] flex items-center gap-1"
                >
                  <span>Track Live</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Shipment Activity History Timeline (Section 14) */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-700">Status History</h4>
              <div className="border border-gray-200 rounded-2xl p-4 divide-y divide-gray-100 space-y-3">
                {(selectedShipment.history || []).map((step, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-[#FF6A00] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{step.activity}</p>
                      <p className="text-[11px] text-gray-500">
                        {step.location} ·{' '}
                        {new Date(step.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

