"""Shared throttle for CPU/GPU-heavy steps when many builders run at once.
Usage:  python research/heavy.py <command ...>     e.g.  python research/heavy.py python cli/nexus.py apply in.png -f x -o out.png
Waits for one of SLOTS lock files (research/wip/.slots/N) before running the command, so at most SLOTS heavy jobs run together.
Stale locks (older than 15 min) are taken over. Also importable: `with slot(): ...`."""
import contextlib, os, subprocess, sys, time
from pathlib import Path
SLOTS = 4
DIR = Path(__file__).resolve().parent / "wip" / ".slots"

@contextlib.contextmanager
def slot():
    DIR.mkdir(parents=True, exist_ok=True)
    while True:
        for i in range(SLOTS):
            f = DIR / str(i)
            try:
                fd = os.open(f, os.O_CREAT | os.O_EXCL | os.O_WRONLY); os.write(fd, str(os.getpid()).encode()); os.close(fd)
                try:
                    yield
                finally:
                    with contextlib.suppress(FileNotFoundError): f.unlink()
                return
            except FileExistsError:
                with contextlib.suppress(FileNotFoundError):
                    if time.time() - f.stat().st_mtime > 900: f.unlink()
        time.sleep(2)

if __name__ == "__main__":
    with slot():
        sys.exit(subprocess.call(sys.argv[1:]))
