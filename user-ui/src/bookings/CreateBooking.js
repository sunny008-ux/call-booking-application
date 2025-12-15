import axios from '../services';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import MainScreen from '../layouts/MainScreen';
import { Form, Button, Row, Col, Card, Alert } from "react-bootstrap";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import 'react-phone-number-input/style.css';
import PhoneInput from "react-phone-number-input";
import { BookIcon } from '../svgs';
import { CONTACT_EMAIL, PAYMENT_NUMBER } from '../config';
import { isPossibleNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { addBooking } from '../services/booking';
import { useMetrics } from '@cabify/prom-react';

function CreateBooking() {
  const { observe } = useMetrics();

  const [bookingInfo, setBookingInfo] = useState({
    name: '',
    email: '',
    phonenumber: '',
    location: '',
    servicetype: 'Career Consulting'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pic, setPic] = useState([null, null]);
  const [phoneMessage, setPhoneMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const fileRef = useRef('');

  /* ✅ FIXED: memoized + safe */
  const getLocation = useCallback(() => {
    axios.get('https://ip-api.com/json')
      .then((data) => {
        setBookingInfo(prev => ({
          ...prev,
          location: `${data.data.city}, ${data.data.regionName}, ${data.data.countryCode}`,
          ip: data.data.query
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const postDetails = (pics) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPic([pics, reader.result]);
    };
    reader.readAsDataURL(pics);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    observe('bookings_event', { custom_tag: 'booking_event' }, 1);

    if (!isPossibleNumber(bookingInfo.phonenumber) || !isValidPhoneNumber(bookingInfo.phonenumber)) {
      setPhoneMessage('Enter valid number.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    const { name, email, phonenumber, location, servicetype, ip } = bookingInfo;

    formData.append('name', name);
    formData.append('email', email);
    formData.append('phonenumber', phonenumber);
    formData.append('servicetype', servicetype);
    formData.append('location', location);
    formData.append('ip', ip);
    formData.append('image', pic[0]);

    try {
      await addBooking(formData);
      setShowSuccess(true);
      setBookingInfo({
        name: '',
        email: '',
        phonenumber: '',
        location,
        servicetype: 'Career Consulting'
      });
      setPic([null, null]);
      fileRef.current.value = '';

      setTimeout(() => setShowSuccess(false), 10000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
      setTimeout(() => setError(''), 10000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainScreen title="Book Your Slot">
      <Row className='justify-content-center px-2'>
        <Col md={8} xs={12}>

          {showSuccess && (
            <Alert variant="success">
              <Alert.Heading>
                <BookIcon className="mx-2" style={{ width: 15 }} />
                Booked
              </Alert.Heading>
              <p>Your booking is confirmed. Our team will contact you soon.</p>
            </Alert>
          )}

          <Card className='shadow p-4'>
            <Card.Body>
              {error && <ErrorMessage variant="danger">{error}</ErrorMessage>}

              <Form className='row' onSubmit={submitHandler}>

                <Form.Group className='mb-2 col-9'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    required
                    value={bookingInfo.name}
                    onChange={(e) => setBookingInfo({ ...bookingInfo, name: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mb-2 col-6'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={bookingInfo.email}
                    onChange={(e) => setBookingInfo({ ...bookingInfo, email: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className='mb-2 col-6'>
                  <Form.Label>Phone Number</Form.Label>
                  <PhoneInput
                    required
                    defaultCountry='US'
                    className='px-2 form-control'
                    value={bookingInfo.phonenumber}
                    onChange={(val) => {
                      setBookingInfo({ ...bookingInfo, phonenumber: val });
                      setPhoneMessage('');
                    }}
                  />
                  <Form.Text className='text-danger'>{phoneMessage}</Form.Text>
                </Form.Group>

                <Form.Group className='mb-2 col-6'>
                  <Form.Label>Service Type</Form.Label>
                  <Form.Control
                    as="select"
                    value={bookingInfo.servicetype}
                    onChange={(e) => setBookingInfo({ ...bookingInfo, servicetype: e.target.value })}
                  >
                    <option>Career Consulting</option>
                    <option>Mock Interview</option>
                    <option>Devops Consulting</option>
                  </Form.Control>
                  <Form.Text className="text-muted">
                    Payment via PhonePe / GPay to {PAYMENT_NUMBER}
                  </Form.Text>
                </Form.Group>

                <Form.Group className='mb-2 col-9'>
                  <Form.Label>Location</Form.Label>
                  <Form.Control disabled value={bookingInfo.location} />
                </Form.Group>

                <Form.Group className='mb-2 col-9'>
                  <Form.Label>Upload Payment Screenshot</Form.Label>
                  <Form.Control
                    type="file"
                    required
                    accept="image/png,image/jpeg"
                    ref={fileRef}
                    onChange={(e) => postDetails(e.target.files[0])}
                  />
                </Form.Group>

                <div className='d-flex justify-content-center mt-2'>
                  {loading && <Loading size={20} />}
                  <Button type="submit" className='w-50'>Submit</Button>
                </div>

              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className='text-center py-2'>
        For any queries contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </div>
    </MainScreen>
  );
}

export default CreateBooking;
