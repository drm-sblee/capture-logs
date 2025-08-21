import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../api/apiConfig";
import { BrowserBadge, OSBadge } from "../components/Badge";

function LogListPage() {
  function TooltipIcon({ badge, tooltipText }) {
    const wrapperRef = useRef(null);
    const [direction, setDirection] = useState("top");

    const handleMouseEnter = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const spaceAbove = rect?.top ?? 0;

      if (spaceAbove < 201) {
        setDirection("bottom");
      } else {
        setDirection("top");
      }
    };

    return (
      <div
        ref={wrapperRef}
        className="tooltip-wrapper"
        onMouseEnter={handleMouseEnter}
      >
        {badge}
        <div className={`tooltip-box ${direction}`}>
          {tooltipText}
        </div>
      </div>
    );
  }

  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchField, setSearchField] = useState("Username");
  const [searchKeyword, setSearchKeyword] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.ceil(totalCount / pageSize);

  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isPageSizeDropdownOpen, setIsPageSizeDropdownOpen] = useState(false);

  const tableBodyRef = useRef(null);
  const [scrollVisible, setScrollVisible] = useState(false);

  const fetchLogs = ({field, keyword, page, size}) => {
    fetch(`${API_ENDPOINTS.LOGS}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        field: field?.toLowerCase(),
        keyword,
        page,
        size,
      })
    })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    })
    .then((data) => {
      setLogs([]);
      setTotalCount(0);
      setLogs(data.data);
      setTotalCount(data.totalCount);
    })
    .catch((err) => {
      console.error("fetch error: ", err);
    })
  }

  useEffect(() => {
    fetchLogs({
      field: searchField,
      keyword: "",
      page: 1,
      size: pageSize
    });
  }, []);

  useEffect(() => {
    const el = tableBodyRef.current;
    if (el && el.scrollHeight > el.clientHeight) {
        setScrollVisible(true);
    } else {
        setScrollVisible(false);
    }
  }, [logs]);

  const handleSearch = () => {
    setCurrentPage(1);
    
    fetchLogs({
      field: searchField,
      keyword: searchKeyword,
      page: 1,
      size: pageSize
    });
  };
  
  const handleRefresh = () => {
    setSearchKeyword("");
    setCurrentPage(1);
    
    fetchLogs({
      field: searchField,
      keyword: "",
      page: 1,
      size: pageSize
    });
  };

  const formatDateTime = (datetimeStr) => {
    if (!datetimeStr || typeof datetimeStr !== "string") return "";

    const [datePart, timePart] = datetimeStr.split("T");
    if (!datePart) return datetimeStr;

    const [year, month, day] = datePart.split("-");
    const [hour, minute, second] = timePart.split(":");

    return `${year}. ${month}. ${day}. ${hour}:${minute}:${second.split(".")[0]}`;
  };

  return (
    <>
      <div className="app-container">
        <header className="header">
          <div className="title">
            <img src="/imgs/main_logo.svg" className="img-main-logo"/>
            <span>|</span>
            <span>Web-X DRM for Screen Capture Log</span>
          </div>
        </header>
        <main className="main-content">
          <div className="main-content-section">
            <div className="main-content-top-left">
              <div className="dropdown" onClick={() => setIsSearchDropdownOpen(prev => !prev)}>
                <input className="select-wrap" type="text" value={searchField} readOnly />
                <i className="i-dropdown"></i>
                <div className={`dropdown-select ${isSearchDropdownOpen ? "open" : ""}`}>
                  <span className="dropdown-select-option" onClick={(e) => {
                    e.stopPropagation(); setSearchField("Username"); setIsSearchDropdownOpen(false);}}>Username</span>
                  <span className="dropdown-select-option" onClick={(e) => {
                    e.stopPropagation(); setSearchField("MAC Address"); setIsSearchDropdownOpen(false);}}>MAC Address</span>
                  <span className="dropdown-select-option" onClick={(e) => {
                    e.stopPropagation(); setSearchField("Detected Program"); setIsSearchDropdownOpen(false);}}>Detected Program</span>
                  <span className="dropdown-select-option" onClick={(e) => {
                    e.stopPropagation(); setSearchField("Detected Page URL"); setIsSearchDropdownOpen(false);}}>Detected Page URL</span>
                </div>
              </div>
              <div className="search-wrap">
                <input className="input-search" placeholder="Search" type="search"
                value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {if(e.key === "Enter") handleSearch()}}/>
                <button onClick={handleSearch}><i className="i-search"></i></button>
              </div>
              <button className="refresh-btn" onClick={handleRefresh}><i className="i-refresh"></i></button>
            </div>
          </div>
          <div className="main-content-table">
            <div className={`table-thead ${scrollVisible ? "scroll-visible" : ""}`}>
              <table>
                <colgroup>
                  <col style={{ minWidth: "70px" }} width="5%"/>
                  <col style={{ minWidth: "100px" }} width="8%"/>
                  <col style={{ minWidth: "320px" }} width="17%"/>
                  <col style={{ minWidth: "70px" }} width="5%"/>
                  <col style={{ minWidth: "70px" }} width="5%"/>
                  <col width="25%"/>
                  <col width="25%"/>
                  <col style={{ minWidth: "170px" }} width="10%"/>
                </colgroup>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Username</th>
                    <th>Device ID</th>
                    <th>OS</th>
                    <th>Browser</th>
                    <th>Detected Program</th>
                    <th>Detected Page URL</th>
                    <th>Detected Time</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="table-tbody" ref={tableBodyRef}>
              <table>
                <colgroup>
                  <col style={{ minWidth: "70px" }} width="5%"/>
                  <col style={{ minWidth: "100px" }} width="8%"/>
                  <col style={{ minWidth: "320px" }} width="17%"/>
                  <col style={{ minWidth: "70px" }} width="5%"/>
                  <col style={{ minWidth: "70px" }} width="5%"/>
                  <col width="25%"/>
                  <col width="25%"/>
                  <col style={{ minWidth: "170px" }} width="10%"/>
                </colgroup>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={index}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>{log.username}</td>
                      <td>{log.device_id}</td>
                      <td>
                        <div className="td-icon">
                          <TooltipIcon badge={<OSBadge name={log.os_name} />} tooltipText={log.os_name} />
                        </div>
                      </td>
                      <td>
                        <div className="td-icon">
                          <TooltipIcon badge={<BrowserBadge name={log.browser_name} />} tooltipText={log.browser_name} />
                        </div>
                      </td>
                      <td>{log.detected_program}</td>
                      <td>{log.page_url}</td>
                      <td>{formatDateTime(log.detected_time)}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="main-content-bottom">
            <div className="content-bottom-info">
              <div className="dropdown" onClick={() => setIsPageSizeDropdownOpen(prev => !prev)}>
                <input className="select-wrap" type="text" value={`${pageSize} EA`} readOnly />
                <i className="i-dropdown"></i>
                <div className={`dropdown-select ${isPageSizeDropdownOpen ? "open" : ""}`}>
                  {[20, 50, 100].map(size => (
                    <span
                      key={size}
                      className="dropdown-select-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageSize(size);
                        setCurrentPage(1);
                        setIsPageSizeDropdownOpen(false);
                        fetchLogs({
                            page: 1,
                            size: size,
                        });
                      }}
                    >
                      {size} EA
                    </span>
                  ))}
                </div>
              </div>
              <span className="total-count">(Total {totalCount} Logs)</span>
            </div>
            <div className="pagination-wrap">
              <div className="pagination">
                {currentPage > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        fetchLogs({ field: searchField, keyword: searchKeyword, page: 1, size: pageSize });
                      }}
                    >
                      <i className="i-first"></i>
                    </button>
                    <button
                      onClick={() => {
                        const prev = currentPage - 1;
                        setCurrentPage(prev);
                        fetchLogs({ field: searchField, keyword: searchKeyword, page: prev, size: pageSize });
                      }}
                    >
                      <i className="i-left"></i>
                    </button>
                  </>
                )}
                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <button
                      key={page}
                      className={`pagination-num ${currentPage === page ? "active" : ""}`}
                      onClick={() => {
                        setCurrentPage(page);
                        fetchLogs({ field: searchField, keyword: searchKeyword, page, size: pageSize });
                      }}
                    >
                      <span>{page}</span>
                    </button>
                  );
                })}

                {currentPage < totalPages && (
                  <>
                    <button
                      onClick={() => {
                        const next = currentPage + 1;
                        setCurrentPage(next);
                        fetchLogs({field: searchField, keyword: searchKeyword, page: next, size: pageSize });
                      }}
                    >
                      <i className="i-right"></i>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage(totalPages);
                        fetchLogs({field: searchField, keyword: searchKeyword, page: totalPages, size: pageSize });
                      }}
                    >
                      <i className="i-last"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        <footer className="footer">
          <span>Copyright©</span>
          <span>DRM inside</span>
          <span>Co., Ltd. All Rights Reserved.</span>
        </footer>
      </div>
    </>
  )
}

export default LogListPage;
