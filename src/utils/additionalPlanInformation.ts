export const getDentalValuePlanInformationHref = (state: string | null) => {
  switch (state) {
    case 'IA':
      return {
        name: 'Dental Value Plan IA FINAL v2.pdf',
        path: '/assets/Dental Value Plan IA FINAL v2.pdf',
      };
    case 'IL':
      return {
        name: 'Dental Value Plan IL FINAL v2.pdf',
        path: '/assets/Dental Value Plan IL FINAL v2.pdf',
      };
    case 'GA':
      return {
        name: 'Dental Value Plan GA FINAL v2.pdf',
        path: '/assets/Dental Value Plan GA FINAL v2.pdf',
      };
    default:
      return {
        name: 'Dental Plan Value.pdf',
        path: '/assets/Dental Plan Value.pdf',
      };
  }
};

export const getDentalComprehensivePlanInformationHref = (state: string | null) => {
  switch (state) {
    case 'IA':
      return {
        name: 'benworks dental comprehensive plan details exclusions and limitations_IA FINAL.pdf',
        path: '/assets/benworks dental comprehensive plan details exclusions and limitations_IA FINAL.pdf',
      };
    case 'IL':
      return {
        name: 'benworks dental comprehensive plan details exclusions and limitations_IL FINAL.pdf',
        path: '/assets/benworks dental comprehensive plan details exclusions and limitations_IL FINAL.pdf',
      };
    case 'GA':
      return {
        name: 'Dental Plan Comprenhensive (Approved 8.30).pdf',
        path: '/assets/Dental Plan Comprenhensive (Approved 8.30).pdf',
      };
    default:
      return {
        name: 'Dental Plan Comprenhensive (Approved 8.30).pdf',
        path: '/assets/Dental Plan Comprenhensive (Approved 8.30).pdf',
      };
  }
};

export const getVisionPlanInformationHref = (planType: string | null) => {
  switch (planType) {
    case 'Value':
      return {
        name: 'Vision Plan Value (Approved 8.30).pdf',
        path: '/assets/Vision Plan Value (Approved 8.30).pdf',
      };
    case 'Comprehensive':
      return {
        name: 'Vision Plan Comprehensive (Approved 8.30).pdf',
        path: '/assets/Vision Plan Comprehensive (Approved 8.30).pdf',
      };
    default:
      return {
        name: 'Vision Plan Value (Approved 8.30).pdf',
        path: '/assets/Vision Plan Value (Approved 8.30).pdf',
      };
  }
};
