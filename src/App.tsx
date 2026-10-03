import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Services from '@/components/Services';
import Works from '@/components/Works';
import Founder from '@/components/Founder';
import Barbers from '@/components/Barbers';
import Reviews from '@/components/Reviews';
import Locations from '@/components/Locations';
import BookingCta from '@/components/BookingCta';
import Contests from '@/components/Contests';
import Franchise from '@/components/Franchise';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';

function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = useCallback(() => setBookingOpen(true), []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  return (
    <>
      <Header onBooking={openBooking} />
      <main>
        <Hero onBooking={openBooking} />
        <Stats />
        <Services />
        <Works />
        <Founder />
        <Barbers />
        <Reviews />
        <Locations />
        <BookingCta onBooking={openBooking} />
        <Contests />
        <Franchise />
      </main>
      <Footer />
      <BookingModal open={bookingOpen} onClose={closeBooking} />
    </>
  );
}

export default App;
