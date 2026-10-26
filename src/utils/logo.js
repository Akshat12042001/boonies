const readLogoUrl = logo => {
  if (!logo) {
    return '';
  }

  if (typeof logo === 'string') {
    return logo.trim();
  }

  if (typeof logo === 'object') {
    return (
      readLogoUrl(logo.logo) ||
      readLogoUrl(logo.url) ||
      readLogoUrl(logo.imageUrl) ||
      readLogoUrl(logo.uri) ||
      readLogoUrl(logo.logoUrl) ||
      ''
    );
  }

  return '';
};

export const getHomestayLogoUrl = user =>
  readLogoUrl(user?.homestayLogo) ||
  readLogoUrl(user?.data?.homestayLogo) ||
  readLogoUrl(user?.user?.homestayLogo) ||
  readLogoUrl(user?.host?.homestayLogo) ||
  '';

export const getGeneratedLogoUrl = response => {
  if (typeof response?.data === 'string') {
    return response.data;
  }

  return (
    response?.logo ||
    response?.homestayLogo ||
    response?.url ||
    response?.imageUrl ||
    response?.data?.logo ||
    response?.data?.homestayLogo ||
    ''
  );
};
