#include <Logger.h>

log_event_handler_id_t LogEventHandlerInfo::currentEventHandlerId = 0;
std::list<LogEventHandlerInfo> Logger::_eventHandlers = {};
