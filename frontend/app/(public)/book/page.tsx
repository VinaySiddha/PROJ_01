/**
 * /book → redirects to /theaters
 * Handles the "Book Now" CTA in the navbar.
 */
import { redirect } from 'next/navigation';

export default function BookPage() {
  redirect('/theaters');
}
