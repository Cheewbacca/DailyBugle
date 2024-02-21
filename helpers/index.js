const { TextInputBuilder, TextInputStyle } = require("discord.js");

const getBeautifiedValues = (
  valuesAsArrays = [],
  skipSpecialCharacter = false
) => {
  if (!valuesAsArrays.length) {
    return "";
  }

  return valuesAsArrays.map((value) => {
    if (!value || !value.length) {
      return "";
    }

    const [firstElement, ...restElements] = value;
    return [
      `${skipSpecialCharacter ? "" : "- "}${firstElement}`,
      ...restElements,
    ].join("\n   - ");
  });
};

const modalFieldBuilder = ({ value, id, label, required = false }) =>
  new TextInputBuilder()
    .setValue(value || "[EP-XXXX]: some text")
    .setCustomId(id)
    .setLabel(label)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(required);

module.exports = {
  getBeautifiedValues,
  modalFieldBuilder,
};
