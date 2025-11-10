import asyncio
import threading
from concurrent.futures import Future
from typing import Awaitable, Callable, Optional, Union

from kernel.config import config


class _LoopWorker:
    """Wrap a single background loop running inside a daemon thread."""

    def __init__(self) -> None:
        self._ready = threading.Event()
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        self._ready.wait()

    def _run(self) -> None:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self._loop = loop
        self._ready.set()
        loop.run_forever()

    def submit(self, coro_factory: Callable[[], Awaitable]) -> Future:
        if self._loop is None:
            raise RuntimeError("Loop worker not ready")
        return asyncio.run_coroutine_threadsafe(coro_factory(), self._loop)


class BackgroundEventLoopPool:
    """
    Maintain a small pool of background loops. Incoming background jobs are
    scheduled in round-robin fashion to avoid overloading a single loop.
    """

    def __init__(self, size: int) -> None:
        if size < 1:
            raise ValueError("Pool size must be at least 1")
        self._workers = [_LoopWorker() for _ in range(size)]
        self._lock = threading.Lock()
        self._index = 0

    def schedule(
        self,
        coro_factory: Callable[[], Awaitable],
        *,
        callback: Optional[Callable[[Future], None]] = None,
    ) -> Future:
        worker = self._next_worker()
        future = worker.submit(coro_factory)
        if callback:
            future.add_done_callback(callback)
        return future

    def _next_worker(self) -> _LoopWorker:
        with self._lock:
            worker = self._workers[self._index]
            self._index = (self._index + 1) % len(self._workers)
            return worker


def _pool_size_from_env() -> int:
    try:
        return max(1, int(config.BACKGROUND_LOOP_POOL_SIZE))
    except ValueError:
        return 2


background_loop_pool = BackgroundEventLoopPool(size=_pool_size_from_env())

FutureLike = Union[asyncio.Future, Future]
def log_background_task_error(task: FutureLike) -> None:
    try:
        task.result()
    except Exception as exc:
        print(f"Background task execution failed: {exc}")
