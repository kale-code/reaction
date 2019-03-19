import _ from "lodash";

export const transformations = {};
transformations.products = {};
transformations.accounts = {};
transformations.orders = {};

transformations.products.metafields = fieldData => {
  const values = [];
  if (fieldData) {
    for (const field of fieldData) {
      values.push(field.value);
    }
  }
  return values;
};

transformations.accounts.emails = fieldData => {
  const values = [];
  if (fieldData) {
    for (const email of fieldData) {
      values.push(email.address);
    }
  }
  return values;
};

transformations.accounts.profile = fieldData => {
  let profileObject;
  if (fieldData && fieldData.addressBook && fieldData.addressBook[0] && fieldData.addressBook[0].fullName) {
    profileObject = {
      firstName: _.split(fieldData.addressBook[0].fullName, " ")[0],
      lastName: _.split(fieldData.addressBook[0].fullName, " ")[1],
      phone: _.replace(fieldData.addressBook[0].phone, /\D/g, "")
    };
  }
  return profileObject;
};
