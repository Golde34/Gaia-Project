package wo.work_optimization.infrastructure.algorithm.custom;

import lombok.Getter;
import lombok.Setter;
import wo.work_optimization.core.domain.constant.Constants;

import org.apache.commons.math3.analysis.MultivariateFunction;
import org.apache.commons.math3.optim.InitialGuess;
import org.apache.commons.math3.optim.MaxEval;
import org.apache.commons.math3.optim.nonlinear.scalar.GoalType;
import org.apache.commons.math3.optim.nonlinear.scalar.ObjectiveFunction;
import org.apache.commons.math3.optim.nonlinear.scalar.noderiv.NelderMeadSimplex;
import org.apache.commons.math3.optim.nonlinear.scalar.noderiv.SimplexOptimizer;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.IntStream;

@Getter
@Setter
public class CustomModel {
    private double c1; // Constant 1
    private double c2; // Constant 2
    private double c3; // Constant 3

    private double maximumWorkTime; // Maximum Work Time
    private double[] effort; // 1 <= E <= 5
    private double[] enjoyability; // 1 <= B <= 2
    private int taskLength;

    private double[] p0;
    private double[] k;
    private double[] alpha;
    private double[] phi;

    public CustomModel(double c1, double c2, double c3, double[] effort,
            double[] enjoyability, double maximumWorkTime, int taskLength) {
        this.c1 = c1;
        this.c2 = c2;
        this.c3 = c3;
        this.effort = convertEffortValues(effort);
        this.enjoyability = convertEnjoyabilityValues(enjoyability);
        this.maximumWorkTime = maximumWorkTime;
        this.taskLength = taskLength + 1;
        this.p0 = this.calculateInitialProductivity(this.effort, this.enjoyability);
        this.k = this.calculateK(this.effort, this.enjoyability);
        this.alpha = this.calculateAlpha(this.effort, this.enjoyability);
        this.phi = this.calculateFlowState(this.effort, this.enjoyability);
    }

    private double[] convertEffortValues(double[] effort) {
        double[] result = Arrays.copyOf(Arrays.stream(effort).map(v -> v * 4 / 9 + 5f / 9).toArray(),
                effort.length + 1);
        result[effort.length] = Constants.OptimizeVariables.EFFORT_BIAS;
        return result;
    }

    private double[] convertEnjoyabilityValues(double[] enjoyability) {
        double[] result = Arrays.copyOf(Arrays.stream(enjoyability).map(v -> v / 9 + 8f / 9).toArray(),
                enjoyability.length + 1);
        result[enjoyability.length] = Constants.OptimizeVariables.ENJOYABILITY_BIAS;
        return result;
    }

    /**
     * Calculate productivity curve function by time input
     *
     * @param p0    initialProductivity
     * @param alpha alpha
     * @param k     1 / flowState
     * @param t     time
     * @return productivityCurveMaxValue
     */
    public double calculateProductivityCurve(double p0, double alpha, double k, double t) {
        return p0 + alpha * t * Math.exp(k * -1);
    }

    private double[] calculateFlowState(double[] effort, double[] enjoyability) {
        return IntStream.range(0, taskLength).mapToDouble(
                i -> c1 * effort[i] + c2 * enjoyability[i] + c3).toArray();
    }

    private double[] calculateK(double[] effort, double[] enjoyability) {
        return IntStream.range(0, taskLength).mapToDouble(
                i -> 1 / (c1 * effort[i] + c2 * enjoyability[i] + c3)).toArray();
    }

    private double[] calculateInitialProductivity(double[] effort, double[] enjoyability) {
        return IntStream.range(0, taskLength).mapToDouble(
                i -> Math.pow(enjoyability[i], 2) / Math.pow(effort[i], 2)).toArray();
    }

    private double[] calculateAlpha(double[] effort, double[] enjoyability) {
        return IntStream.range(0, taskLength).mapToDouble(
                i -> Math.pow(enjoyability[i], 2) * Math.log(effort[i]) + Math.pow(enjoyability[i], 2)).toArray();
    }

    /**
     * When to stop doing a task
     * Measure the best time to do a task, that time to execute task not too long
     * that you will burn out
     * or not too short that you not get enough value to your task
     *
     * @param alpha     alpha
     * @param flowState flowState
     * @return time
     */
    public double getMaximumDeepWorkTimePerTask(double alpha, double flowState) {
        double t = 1;
        int maxIterations = 1000;
        double tolerance = 1e-6;

        for (int i = 0; i < maxIterations; i++) {
            double f = getFunction(t, flowState, alpha);
            double fPrime = getDerivative(t, flowState, alpha);

            // Update the guess using the Newton-Raphson formula
            double nextGuess = t - f / fPrime;
            if (Math.abs(nextGuess - t) < tolerance) {
                return nextGuess;
            }
            t = nextGuess;
        }

        return Double.NaN;
    }

    private double getFunction(double t, double flowState, double alpha) {
        return alpha * Math.exp(-t / flowState) * (Math.pow(t, 2) / Math.pow(flowState, 2) + t / flowState + 1) - alpha;
    }

    private double getDerivative(double t, double flowState, double alpha) {
        return -alpha * Math.exp(-t / flowState) * (2 * t / Math.pow(flowState, 3) + 1 / Math.pow(flowState, 2));
    }

    /**
     * Optimize the time allocation for each task
     * Using Zenith gradient algorithm
     */
    public Map<String, List<Double>> optimize() {
        List<Double> weights = new ArrayList<>();
        List<Double> averageStopTime = new ArrayList<>();
        double[] initialT = new double[taskLength];
        Arrays.fill(initialT, maximumWorkTime / taskLength);

        SimplexOptimizer optimizer = new SimplexOptimizer(1e-6, 1e-6);
        double[] optimizedT = optimizer.optimize(
                new ObjectiveFunction(new ProductivityFunction(p0, alpha, k)),
                new InitialGuess(initialT),
                GoalType.MAXIMIZE,
                new NelderMeadSimplex(taskLength), // taskLength-dimensional simplex
                new MaxEval(1000)).getPoint();

        AtomicReference<Double> sum = new AtomicReference<>((double) 0);
        System.out.println("Optimized Time Allocation:");

        IntStream.range(0, taskLength)
                .forEach(index -> {
                    System.out.printf("Productivity Curve: %s + %s * t * e ^ -(%s * t)%n", p0[index], alpha[index],
                            k[index]);
                    System.out.println("Productivity Curve value: "
                            + calculateProductivityCurve(p0[index], alpha[index], k[index], optimizedT[index]));
                    System.out.println("Average stop time: " + getMaximumDeepWorkTimePerTask(alpha[index], phi[index]));
                    System.out.println("Final T: " + optimizedT[index]);
                    sum.updateAndGet(v -> v + optimizedT[index]);
                    weights.add(optimizedT[index]);
                    averageStopTime.add(getMaximumDeepWorkTimePerTask(alpha[index], phi[index]));
                });
        System.out.println("Sum: " + sum);
        return new HashMap<>() {
            {
                put("weights", weights.subList(0, weights.size() - 1));
                put("averageStopTime", averageStopTime.subList(0, averageStopTime.size() - 1));
            }
        };
    }

    private double lagrangeFunction(double p0, double alpha, double k, double t) {
        return (p0 * Math.pow(k, 2) * t - alpha * Math.exp(-k * t) * (k * t + 1) + alpha) / (Math.pow(k, 2) * t);
    }

    class ProductivityFunction implements MultivariateFunction {
        double[] p0, a, k;
        double T = 13; // Man cannot work more than 13 hour a day, try to balance man.

        public ProductivityFunction(double[] p0, double[] a, double[] k) {
            this.p0 = p0;
            this.a = a;
            this.k = k;
        }

        @Override
        public double value(double[] t) {
            double lastT = T;
            for (int i = 0; i < t.length - 1; i++) {
                lastT -= t[i];
            }
            t[t.length - 1] = lastT;

            return IntStream.range(0, t.length)
                    .mapToDouble(i -> lagrangeFunction(p0[i], a[i], k[i], t[i]))
                    .sum();
        }
    }

    public static void main(String[] args) {
        // double[] effort = {3.408, 2.556, 0.852, 1.331, 1.065, 0.015};
        // double[] enjoyability = {1.938, 0.831, 0.242, 1.732, 1.23, 0.058};
        // double[] effort = {8.52, 6.39, 2.13};
        // double[] enjoyability = {3.876, 1.662, 0.484};
        double[] effort = { 8.520710059171599, 6.390532544378699, 2.1301775147928996, 3.3284023668639056,
                2.6627218934911245, 0.07396449704142012 };
        double[] enjoyability = { 3.876923076923077, 1.6615384615384619, 0.4846153846153846, 3.4615384615384617,
                2.4615384615384617, 0.6923076923076924 };

        // double[] effort = {7.4976, 5.6232, 1.8744, 2.9282, 2.343, 0.033};
        // double[] enjoyability = {4.2636, 1.8282, 0.5324, 3.8104, 2.706, 0.1276};
        // double[] effort = {3, 6, 4, 8}; // Khởi tạo mảng p0
        // double[] enjoyability = {2, 5, 4, 3};
        double T = 13; // Tổng thời gian có sẵn
        int taskLength = effort.length;
        CustomModel customModel = new CustomModel(0.56, -0.24, 0, effort, enjoyability, T, taskLength);
        customModel.optimize();
    }
}
