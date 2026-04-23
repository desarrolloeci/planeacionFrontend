export function getSlideSize(slidesToShow) {
  if (slidesToShow && typeof slidesToShow === 'object') {
    return Object.keys(slidesToShow).reduce((acc, key) => {
      const sizeByKey = slidesToShow[key];
      acc[key] = getValue(sizeByKey);
      return acc;
    }, {});
  }

  return getValue(slidesToShow);
}



function getValue(value = 1) {
  if (typeof value === 'string') {
    const isSupported = value === 'auto' || value.endsWith('%') || value.endsWith('px');
    if (!isSupported) {
      throw new Error(`Only accepts values: auto, px, %, or number.`);
    }
    
    return `0 0 ${value}`;
  }

  if (typeof value === 'number') {
    return `0 0 ${100 / value}%`;
  }

  
  throw new Error(`Invalid value type. Only accepts values: auto, px, %, or number.`);
}
