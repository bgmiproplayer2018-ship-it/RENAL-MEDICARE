import React from 'react';

interface SkeletonProps {
  className?: string;
  id?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', id }) => {
  return (
    <div
      id={id}
      className={`bg-slate-200/75 animate-pulse rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};

export const CardGridSkeleton: React.FC<{ count?: number; columns?: string }> = ({
  count = 6,
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}) => {
  return (
    <div className={`grid ${columns} gap-6 sm:gap-8`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col p-4 sm:p-5 space-y-4"
        >
          <div className="w-full h-44 sm:h-48 bg-slate-200/70 rounded-xl sm:rounded-2xl animate-pulse" />
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-4/5 rounded-md" />
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white py-12 sm:py-20 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 sm:h-14 w-full rounded-xl" />
              <Skeleton className="h-10 sm:h-14 w-4/5 rounded-xl" />
            </div>
            <div className="space-y-2 max-w-xl">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-11/12 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Skeleton className="h-12 w-44 rounded-xl" />
              <Skeleton className="h-12 w-36 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <div className="space-y-3 pt-2">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppointmentFormSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <Skeleton className="h-6 w-32 mx-auto rounded-full" />
        <Skeleton className="h-10 w-3/4 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-5/6 mx-auto rounded-md" />
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 rounded-md" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
};

export const TrackingSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <Skeleton className="h-6 w-36 mx-auto rounded-full" />
        <Skeleton className="h-10 w-2/3 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-4/5 mx-auto rounded-md" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-28 rounded-xl" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
};

export const AdminSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-9 w-44 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ContactSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <Skeleton className="h-6 w-28 mx-auto rounded-full" />
        <Skeleton className="h-10 w-3/4 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-5/6 mx-auto rounded-md" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <Skeleton className="h-6 w-44 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const PageSkeleton: React.FC<{ type?: string }> = ({ type = 'home' }) => {
  switch (type) {
    case 'services':
    case 'hospitals':
    case 'blog':
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-200 space-y-3">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-10 w-2/3 rounded-xl" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
          <CardGridSkeleton count={6} />
        </div>
      );

    case 'appointment':
      return <AppointmentFormSkeleton />;

    case 'tracking':
      return <TrackingSkeleton />;

    case 'contact':
      return <ContactSkeleton />;

    case 'admin':
      return <AdminSkeleton />;

    case 'home-dialysis':
    case 'about':
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="bg-slate-50 p-6 sm:p-12 rounded-3xl border border-slate-200 space-y-4">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Skeleton className="h-80 rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <div className="pt-4 grid grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'home':
    default:
      return (
        <div className="space-y-12">
          <HeroSkeleton />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CardGridSkeleton count={3} />
          </div>
        </div>
      );
  }
};
