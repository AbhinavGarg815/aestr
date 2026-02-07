const WallNav = ({ totalCount = 0, onHome }) => (
  <header className="wall-nav">
    <button className="wall-name" type="button" onClick={onHome}>wallofshame</button>
    <span className="wall-count">Total Count: {totalCount}</span>
  </header>
);

export default WallNav;
