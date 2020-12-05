import asyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'
import NodeGeocoder from 'node-geocoder';
import pkg from 'geolib';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
  } = req.body

  if (orderItems && orderItems.length === 0) {
      res.status(400)
      throw newError('No order items')
      return
  } else {
      const order = new Order({
          orderItems,
          user: req.user._id,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice
      })

      const createdOrder = await order.save()

      res.status(201).json(createdOrder)
  }
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(order) {
        res.json(order)
    } else {
        res.status(404)
        throw new Error('Order not found')
    }
})

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private

const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if(order) {
        order.isPaid = true
        order.paidAt = Date.now()
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address
        }

        const updatedOrder = await order.save()

        res.json(updatedOrder)
    } else {
        res.status(404)
        throw new Error('Order not found')
    }
})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {

    ;

    const orders = await Order.find({ user: req.user._id })
    res.json(orders)
})

const getDeliveryFee = asyncHandler(async (req, res) => {
    const { zipcode} = req.body;
    console.log(req.body);
    const { getDistance } = pkg;
    const options = {
        provider: 'mapquest',
        httpAdapter: 'https',
        apiKey: 'FNhdOcLiIpzZWtxZedD4QbJbejPjgCWV',
        formatter: null,
      };
       
    const geocoder = NodeGeocoder(options)


// puchong
    // const result = await geocoder.geocode(47100);
    const result = await geocoder.geocode({
        country: 'Malaysia',
        zipcode: 47100
      });
    // const clientResult = await geocoder.geocode(zipcode);
      const clientResult = await geocoder.geocode({
        country: 'Malaysia',
        zipcode: zipcode
      });

      console.log('result',result);
      console.log('clientresult',clientResult)
      

    let distance =  getDistance(
        { latitude: result[0].latitude, longitude: result[0].longitude },
        { latitude: clientResult[0].latitude, longitude: clientResult[0].longitude }
    );

    console.log('distance',distance)

    // convert distance to km

    const distanceinKm = distance / 1000

    // round up the numbers
    const deliveryFee = Math.ceil(distanceinKm)

    res.json(deliveryFee)
})

export { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders, getDeliveryFee }