const WallNav = ({ totalCount = 0 }) => (
  <header className="wall-nav">
    <span className="wall-name">wallofshame</span>
    <span className="wall-count">Total Count: {totalCount}</span>
  </header>
);

export default WallNav;
