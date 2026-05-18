export const serializeCarData = (car, wishlisted = false) => {
    return {
        ...car,
    images: car.image || [],
        price: car.price ? parseFloat(car.price.toString()) : 0,
        createdAt: car.createdAt?.toISOString(),
        updatedAt: car.updatedAt?.toISOString(),
        wishlisted,

    };
};

export const serializedCarData = serializeCarData;

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

