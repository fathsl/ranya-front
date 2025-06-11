import "/node_modules/flag-icons/css/flag-icons.min.css";
const FlagIcon = ({
  countryCode,
  small = true,
}: {
  countryCode: string;
  small?: boolean;
}) => {
  return <span className={`fi fi-${countryCode} ${small ? "fis" : ""}`} />;
};
export default FlagIcon;
