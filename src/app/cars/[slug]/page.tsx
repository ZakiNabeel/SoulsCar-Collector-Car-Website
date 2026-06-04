import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCarBySlug, getCars } from "@/lib/sheets";
import { CarDetailClient } from "./_client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return {};
  return {
    title: `${car.year} ${car.name} — SoulCars.pk`,
    description: car.description,
    openGraph: { images: [car.image] },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const { slug } = await params;
  const [car, allCars] = await Promise.all([getCarBySlug(slug), getCars()]);
  if (!car) notFound();
  return <CarDetailClient car={car} allCars={allCars} />;
}
