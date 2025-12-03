interface DashboardHeaderProps {
  userType?: "user" | "admin";
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userType }) => {
  return (
    <header>
      {/* Header content */}
      <div>User Type: {userType}</div>
    </header>
  );
};

export default DashboardHeader;