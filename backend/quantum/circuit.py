"""
QHeal — Real PennyLane + Qiskit Variational Quantum Circuit (VQC) implementation.
Supports local simulation, Qiskit Aer noise modeling, and real QPU cloud backends (IBM Quantum).
Includes an analytical NumPy simulator fallback for zero-downtime robustness.
"""

from __future__ import annotations
import numpy as np

# ── 1. CHECK PENNYLANE & QISKIT AVAILABILITY ──────────────────────────────────
try:
    import pennylane as qml
    from pennylane import numpy as pnp
    PENNYLANE_AVAILABLE = True
except ImportError:
    PENNYLANE_AVAILABLE = False
    pnp = np

NUMPY_QUANTUM = True

# ── 2. DYNAMIC QUANTUM DEVICE ABSTRACTION & IBM AUTHENTICATION ───────────────
# Device mode select:
#   - "default.qubit" : High-performance analytical local simulator
#   - "qiskit.aer"    : High-fidelity Aer simulator (with noise models)
#   - "ibm"           : Real IBM Quantum hardware backends
QUANTUM_DEVICE_MODE = "default.qubit"
IBM_TOKEN = None  # Insert your IBM Quantum API Token here to authenticate

# Real QPU backend suggestions: "ibm_torino", "ibm_kyoto", "ibm_osaka"
IBM_BACKEND_NAME = "ibm_osaka" 

dev = None
pennylane_vqc_circuit = None

if PENNYLANE_AVAILABLE:
    try:
        if QUANTUM_DEVICE_MODE == "default.qubit":
            dev = qml.device("default.qubit", wires=4)
        elif QUANTUM_DEVICE_MODE == "qiskit.aer":
            try:
                import qiskit_aer
                dev = qml.device("qiskit.aer", wires=4)
                print("  [QHEAL] Qiskit Aer simulation backend successfully loaded.")
            except ImportError:
                print("  [QHEAL] qiskit-aer not found. Falling back to default.qubit.")
                dev = qml.device("default.qubit", wires=4)
        elif QUANTUM_DEVICE_MODE == "ibm":
            if IBM_TOKEN:
                try:
                    # Authenticate and load IBM QPU
                    import qiskit_ibm_runtime
                    qml.enable_tape()
                    dev = qml.device("qiskit.ibmq", wires=4, backend=IBM_BACKEND_NAME, ibmqx_token=IBM_TOKEN)
                    print(f"  [QHEAL] Authenticated with IBM Quantum. Targeting physical QPU: {IBM_BACKEND_NAME}.")
                except Exception as exc:
                    print(f"  [QHEAL] IBM connection failed: {exc}. Falling back to default.qubit.")
                    dev = qml.device("default.qubit", wires=4)
            else:
                print("  [QHEAL] IBM_TOKEN is not set. Falling back to default.qubit.")
                dev = qml.device("default.qubit", wires=4)
        else:
            dev = qml.device("default.qubit", wires=4)
            
        # Define the QNode
        @qml.qnode(dev)
        def pennylane_vqc_circuit(x):
            # Layer 1: RY feature encoding for patient health metrics
            for i in range(4):
                qml.RY(x[i] * pnp.pi, wires=i)
                
            # Layer 2: Ring CNOT entanglement structure
            for i in range(3):
                qml.CNOT(wires=[i, i+1])
            qml.CNOT(wires=[3, 0])  # Close the ring
            
            # Layer 3: Rotational mixing with shifted features
            for i in range(4):
                qml.RY(x[(i+1)%4] * pnp.pi / 2, wires=i)
                
            # Layer 4: Controlled-Z entanglement
            for i in range(0, 3, 2):
                qml.CZ(wires=[i, i+1])
                
            # Measurement: return full 16-dimensional probability distribution
            return qml.probs(wires=range(4))
            
    except Exception as exc:
        print(f"  [QHEAL] Failed to configure PennyLane device: {exc}. Using NumPy emulator fallback.")
        PENNYLANE_AVAILABLE = False


# ── 3. HIGH-FIDELITY ANALYTICAL NUMPY FALLBACK EMULATOR ───────────────────────

def ry(theta: float) -> np.ndarray:
    """Single-qubit RY rotation matrix."""
    c, s = np.cos(theta / 2), np.sin(theta / 2)
    return np.array([[c, -s], [s, c]], dtype=complex)


def _kron_gate(gate: np.ndarray, target: int, n: int) -> np.ndarray:
    """Embed a single-qubit gate into an n-qubit system."""
    ops = [np.eye(2, dtype=complex)] * n
    ops[target] = gate
    result = ops[0]
    for op in ops[1:]:
        result = np.kron(result, op)
    return result


def _cnot(control: int, target: int, n: int) -> np.ndarray:
    """CNOT gate in n-qubit Hilbert space."""
    dim = 2 ** n
    mat = np.eye(dim, dtype=complex)
    for i in range(dim):
        bits = format(i, f'0{n}b')
        if bits[control] == '1':
            j_bits = list(bits)
            j_bits[target] = '1' if bits[target] == '0' else '0'
            j = int(''.join(j_bits), 2)
            mat[i, i] = 0
            mat[j, i] = 1
    return mat


def _cz(control: int, target: int, n: int) -> np.ndarray:
    """CZ gate in n-qubit Hilbert space."""
    dim = 2 ** n
    mat = np.eye(dim, dtype=complex)
    for i in range(dim):
        bits = format(i, f'0{n}b')
        if bits[control] == '1' and bits[target] == '1':
            mat[i, i] = -1
    return mat


def extract_quantum_features_numpy(x: np.ndarray, n_qubits: int = 4) -> np.ndarray:
    """
    Simulate a 4-qubit VQC using NumPy matrix algebra.
    Provides identical analytical outputs for zero-dependency portability.
    """
    dim = 2 ** n_qubits
    x4 = np.array(x[:n_qubits], dtype=float)
    if len(x) < n_qubits:
        x4 = np.pad(x4, (0, n_qubits - len(x4)))

    # Initial state |0000⟩
    state = np.zeros(dim, dtype=complex)
    state[0] = 1.0

    # Layer 1: RY encoding
    for i in range(n_qubits):
        theta = float(x4[i]) * np.pi
        U = _kron_gate(ry(theta), i, n_qubits)
        state = U @ state

    # Layer 2: Ring CNOT entanglement
    for i in range(n_qubits - 1):
        state = _cnot(i, i + 1, n_qubits) @ state
    state = _cnot(n_qubits - 1, 0, n_qubits) @ state

    # Layer 3: RY mixing with shifted features
    for i in range(n_qubits):
        theta = float(x4[(i + 1) % n_qubits]) * np.pi / 2
        U = _kron_gate(ry(theta), i, n_qubits)
        state = U @ state

    # Layer 4: CZ entanglement pairs
    for i in range(0, n_qubits - 1, 2):
        state = _cz(i, i + 1, n_qubits) @ state

    # Measurement
    probs = np.abs(state) ** 2
    probs /= probs.sum() + 1e-12
    return probs.astype(np.float64)


# ── 4. PUBLIC INTEGRATION PIPELINE ENTRYPOINTS ───────────────────────────────

def extract_quantum_features(x: np.ndarray, n_qubits: int = 4) -> np.ndarray:
    """
    Execute 4-qubit VQC model inference on active device.
    Uses physical PennyLane device when available; falls back to fast NumPy emulation.
    """
    global PENNYLANE_AVAILABLE
    if PENNYLANE_AVAILABLE and pennylane_vqc_circuit is not None:
        try:
            x_arr = np.array(x[:n_qubits], dtype=float)
            if len(x_arr) < n_qubits:
                x_arr = np.pad(x_arr, (0, n_qubits - len(x_arr)))
            
            # Execute on active PennyLane QNode device (QPU-ready)
            probs = pennylane_vqc_circuit(x_arr)
            return np.array(probs, dtype=np.float64)
        except Exception as exc:
            print(f"  [QHEAL] PennyLane execution error: {exc}. Falling back to NumPy emulator.")
            return extract_quantum_features_numpy(x, n_qubits)
    else:
        return extract_quantum_features_numpy(x, n_qubits)


def extract_quantum_features_batch(X: np.ndarray) -> np.ndarray:
    """Batch feature extraction for ML training pipeline compatibility."""
    return np.array([extract_quantum_features(row) for row in X])
