import { notFound } from 'next/navigation';

export default function NotFoundTest() {
  notFound();
  return <div>This will not be rendered</div>;
}
