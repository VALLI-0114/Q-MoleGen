# Phase 11: Quantum Computing Fundamentals & Mathematical Formulation

## 1. Executive Summary & Context in Q-MolGen
In the **Q-MolGen** architecture, quantum computing is integrated to explore whether high-dimensional quantum Hilbert spaces provide representational advantages or non-linear kernel transformations for molecular property prediction and candidate prioritization.

Rather than making unverified claims of "quantum supremacy," Q-MolGen implements a **hybrid classical-quantum workflow** grounded in rigorous theoretical chemistry and Noisy Intermediate-Scale Quantum (NISQ) algorithms.

---

## 2. Quantum Information Primitives

### 2.1 Qubits and Superposition
In classical computing, a bit is strictly deterministic: $b \in \{0, 1\}$.
In quantum computing, a **qubit** (quantum bit) is a two-level quantum mechanical state represented as a normalized unit vector in a 2-dimensional complex Hilbert space $\mathbb{C}^2$:

$$|\psi\rangle = \alpha |0\rangle + \beta |1\rangle = \alpha \begin{pmatrix} 1 \\ 0 \end{pmatrix} + \beta \begin{pmatrix} 0 \\ 1 \end{pmatrix}$$

where $\alpha, \beta \in \mathbb{C}$ are probability amplitudes satisfying the normalization constraint:

$$|\alpha|^2 + |\beta|^2 = 1$$

- $|\alpha|^2$: Probability of measuring the ground state $|0\rangle$.
- $|\beta|^2$: Probability of measuring the excited state $|1\rangle$.

### 2.2 The Bloch Sphere Geometry
Any single-qubit state $|\psi\rangle$ can be parameterized geometrically on the unit 3-sphere (the **Bloch Sphere**) using two real angles $\theta \in [0, \pi]$ and $\phi \in [0, 2\pi)$:

$$|\psi\rangle = \cos\left(\frac{\theta}{2}\right)|0\rangle + e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle$$

```
           |0⟩  (North Pole: θ = 0)
            ▲
            │      • |ψ⟩ (θ, ϕ)
            │    /
            │  /
            │/______► Y
           / \
         /     \
       ▼         ▼
     X            |1⟩  (South Pole: θ = π)
```

### 2.3 Multi-Qubit Tensor Product States & Entanglement
For an $n$-qubit register, the state space expands exponentially to an $N = 2^n$-dimensional Hilbert space $\mathcal{H} = (\mathbb{C}^2)^{\otimes n}$:

$$|\Psi\rangle = \sum_{k=0}^{2^n - 1} c_k |k\rangle, \quad \sum_{k=0}^{2^n - 1} |c_k|^2 = 1$$

A state is **entangled** if it cannot be decomposed into a tensor product of individual single-qubit states:

$$|\Psi_{\text{entangled}}\rangle \neq |\psi_1\rangle \otimes |\psi_2\rangle \otimes \cdots \otimes |\psi_n\rangle$$

Example (Bell State $|\Phi^+\rangle$):
$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

---

## 3. Quantum Logic Gates & Unitary Operators

Quantum operations are represented by unitary matrices $U \in \mathbb{C}^{2^n \times 2^n}$ such that $U^\dagger U = I$, preserving quantum state norm.

### 3.1 Single-Qubit Elementary Gates
1. **Pauli-X (Quantum NOT)**:
   $$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad X|0\rangle = |1\rangle, \quad X|1\rangle = |0\rangle$$

2. **Pauli-Z (Phase Flip)**:
   $$Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}, \quad Z|0\rangle = |0\rangle, \quad Z|1\rangle = -|1\rangle$$

3. **Hadamard ($H$) (Superposition Generator)**:
   $$H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}, \quad H|0\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}} = |+\rangle, \quad H|1\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}} = |-\rangle$$

4. **Arbitrary Rotation Gates ($R_x, R_y, R_z$)**:
   $$R_z(\theta) = \exp\left(-i\frac{\theta}{2}Z\right) = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}$$
   $$R_y(\theta) = \exp\left(-i\frac{\theta}{2}Y\right) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$

### 3.2 Two-Qubit Entangling Gates
1. **Controlled-NOT ($\text{CNOT}$ / $CX$)**:
   $$CX = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{pmatrix}$$
   $$CX|00\rangle = |00\rangle, \quad CX|01\rangle = |01\rangle, \quad CX|10\rangle = |11\rangle, \quad CX|11\rangle = |10\rangle$$

---

## 4. Quantum Data Embedding for Cheminformatics

To process classical molecular descriptors $\mathbf{x} = [x_1, x_2, \dots, x_d]^T \in \mathbb{R}^d$ on quantum hardware, we must map classical vectors to quantum states via a **Quantum Feature Map** $\mathcal{U}_\Phi(\mathbf{x})$.

### 4.1 Embedding Strategies
| Embedding Method | Hilbert Space Dim | Circuit Depth | Non-linear Expressivity | NISQ Feasibility |
| :--- | :--- | :--- | :--- | :--- |
| **Basis Encoding** | $\mathcal{O}(2^d)$ | $\mathcal{O}(d)$ | Low (Binary only) | High |
| **Amplitude Encoding** | $\mathcal{O}(\log_2 d)$ | $\mathcal{O}(2^d)$ | Linear | Low (Deep state preparation) |
| **Angle Embedding** | $\mathcal{O}(d)$ qubits | $\mathcal{O}(1)$ | Moderate ($R_y, R_z$) | High |
| **$ZZ\text{FeatureMap}$ (Second-Order Pauli)** | $\mathcal{O}(d)$ qubits | $\mathcal{O}(d^2 \cdot \text{reps})$ | **High (Non-linear Entangled)** | **Optimal for QML** |

### 4.2 The $ZZ\text{FeatureMap}$ Formulation (Havlíček et al., Nature 2019)
For a normalized feature vector $\mathbf{x} \in [0, \pi]^n$, the second-order Pauli expansion feature map is defined as:

$$\mathcal{U}_{\Phi}(\mathbf{x}) = \left( \exp\left(i \sum_{j} \phi_j(\mathbf{x}) Z_j + \sum_{j < k} \phi_{jk}(\mathbf{x}) Z_j Z_k \right) H^{\otimes n} \right)^d$$

where:
- $\phi_j(\mathbf{x}) = 2 x_j$ (single-qubit rotation proportional to feature value)
- $\phi_{jk}(\mathbf{x}) = 2 (\pi - x_j)(\pi - x_k)$ (two-qubit cross-correlation phase shift)
- $d$: Number of repetitions (layers, default $d=2$).

This circuit generates high-dimensional non-classical correlations that are provably difficult to simulate classically for deep circuits.

---

## 5. Quantum Kernel Estimation & QSVC

### 5.1 Quantum Kernel Trick
In Support Vector Machines, kernel functions $K(\mathbf{x}_i, \mathbf{x}_j)$ compute inner products in a high-dimensional feature space $\mathcal{F}$:

$$K(\mathbf{x}_i, \mathbf{x}_j) = \langle \Phi(\mathbf{x}_i), \Phi(\mathbf{x}_j) \rangle_{\mathcal{F}}$$

In **Quantum Support Vector Classification (QSVC)**, the feature map maps $\mathbf{x} \to |\Phi(\mathbf{x})\rangle = \mathcal{U}_\Phi(\mathbf{x}) |0^{\otimes n}\rangle$.
The quantum kernel is the transition fidelity between the two quantum states:

$$K_Q(\mathbf{x}_i, \mathbf{x}_j) = \left| \langle \Phi(\mathbf{x}_i) | \Phi(\mathbf{x}_j) \rangle \right|^2 = \left| \langle 0^{\otimes n} | \mathcal{U}_\Phi^\dagger(\mathbf{x}_j) \mathcal{U}_\Phi(\mathbf{x}_i) | 0^{\otimes n} \rangle \right|^2$$

```
|0⟩ ────► [ U_Φ(x_i) ] ────► [ U_Φ†(x_j) ] ────► Measurement ────► Pr(|00...0⟩) = K_Q(x_i, x_j)
```

### 5.2 Mathematical Properties of $K_Q$
1. **Symmetry**: $K_Q(\mathbf{x}_i, \mathbf{x}_j) = K_Q(\mathbf{x}_j, \mathbf{x}_i)$
2. **Self-Fidelity**: $K_Q(\mathbf{x}_i, \mathbf{x}_i) = 1.0$
3. **Positive Semi-Definite (Gram Matrix)**: For any dataset $\{\mathbf{x}_1, \dots, \mathbf{x}_N\}$, the kernel matrix $\mathbf{K} \in \mathbb{R}^{N \times N}$ satisfies $\mathbf{v}^T \mathbf{K} \mathbf{v} \ge 0 \quad \forall \mathbf{v} \in \mathbb{R}^N$.

### 5.3 QSVC Dual Optimization
The dual optimization problem solved by QSVC is identical to classical SVM, using the quantum-computed Gram matrix $\mathbf{K}_Q$:

$$\max_{\boldsymbol{\alpha}} \sum_{i=1}^N \alpha_i - \frac{1}{2} \sum_{i=1}^N \sum_{j=1}^N \alpha_i \alpha_j y_i y_j K_Q(\mathbf{x}_i, \mathbf{x}_j)$$

$$\text{subject to } \quad 0 \le \alpha_i \le C, \quad \sum_{i=1}^N \alpha_i y_i = 0$$

The decision function for a new candidate molecule $\mathbf{x}^*$ is:

$$f(\mathbf{x}^*) = \text{sign}\left( \sum_{i \in \text{SV}} \alpha_i y_i K_Q(\mathbf{x}_i, \mathbf{x}^*) + b \right)$$

---

## 6. Scientific Rigor & NISQ Limitations

1. **Barren Plateaus**: Deep parameterized circuits experience exponentially vanishing gradients $\text{Var}[\partial_\theta \langle H \rangle] \in \mathcal{O}(2^{-n})$. We maintain shallow circuit depth ($d=2$) and small qubit counts ($n=4$) to ensure robust training.
2. **Shot Noise & Sampling Overhead**: On real quantum backends, estimating $K_Q(\mathbf{x}_i, \mathbf{x}_j)$ requires $S$ measurement shots, introducing finite sampling variance $\mathcal{O}(1/\sqrt{S})$. In our simulations, we use statevector and shot-based Aer backends.
3. **Honest Comparative Analysis**: We rigorously benchmark QSVC against classical RBF SVM and Random Forest on the identical feature space.
