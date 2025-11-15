"""
Comparison Service
Compares medical reports to track health progress
"""

from typing import List, Optional, Dict
from models.report import MedicalValue, ComparisonResult


class CompareService:
    """Service for comparing medical reports"""

    def __init__(self):
        """Initialize test categories for grouping"""
        self.test_categories = {
            'Blood Count': [
                'hemoglobin', 'haemoglobin', 'hb', 'hgb',
                'rbc', 'red blood cell', 'wbc', 'white blood cell',
                'platelet', 'hematocrit', 'haematocrit', 'hct',
                'mcv', 'mch', 'mchc', 'rdw', 'mpv', 'esr',
                'neutrophil', 'lymphocyte', 'eosinophil', 'monocyte', 'basophil'
            ],
            'Lipid Profile': [
                'cholesterol', 'triglyceride', 'hdl', 'ldl', 'vldl',
                'chol/hdl', 'ldl/hdl', 'non hdl'
            ],
            'Diabetes': [
                'glucose', 'sugar', 'fasting', 'random', 'pp', 'ppbs',
                'hba1c', 'glycated', 'glycosylated'
            ],
            'Thyroid': [
                't3', 't4', 'tsh', 'triiodothyronine', 'thyroxine',
                'thyroid stimulating'
            ],
            'Liver Function': [
                'sgpt', 'alt', 'sgot', 'ast', 'alp', 'ggt',
                'bilirubin', 'albumin', 'globulin', 'protein',
                'a/g ratio'
            ],
            'Kidney Function': [
                'creatinine', 'urea', 'bun', 'uric acid',
                'sodium', 'potassium', 'chloride', 'calcium'
            ],
            'Vitamins': [
                'vitamin', 'vit', 'b12', 'folate', 'folic'
            ],
            'Iron Studies': [
                'iron', 'ferritin', 'tibc', 'transferrin'
            ],
            'Other Tests': []  # Catch-all for unclassified tests
        }

    def compare_reports(self, old_values: List[MedicalValue],
                       new_values: List[MedicalValue]) -> List[ComparisonResult]:
        """
        Compare two sets of medical values
        Args:
            old_values: Medical values from older report
            new_values: Medical values from newer report
        Returns:
            List of ComparisonResult objects
        """
        comparison_results = []

        # Create dictionary for quick lookup
        old_dict = {val.name.lower(): val for val in old_values}
        new_dict = {val.name.lower(): val for val in new_values}

        # Find common parameters
        common_params = set(old_dict.keys()) & set(new_dict.keys())

        for param in common_params:
            old_val = old_dict[param]
            new_val = new_dict[param]

            # Skip if either value is None
            if old_val.value is None or new_val.value is None:
                continue

            # Check if values are numeric or string
            if isinstance(old_val.value, str) or isinstance(new_val.value, str):
                # For string values (like blood groups), just compare equality
                if old_val.value == new_val.value:
                    trend = "stable"
                else:
                    trend = "changed"

                comparison = ComparisonResult(
                    parameter_name=old_val.name,
                    old_value=old_val.value,
                    new_value=new_val.value,
                    change=None,
                    change_percentage=None,
                    trend=trend,
                    unit=new_val.unit
                )
            else:
                # For numeric values, calculate change
                change = new_val.value - old_val.value
                change_percentage = (change / old_val.value * 100) if old_val.value != 0 else 0

                # Determine trend (pass old_value for better percentage-based thresholding)
                trend = self._determine_trend(param, change, old_val.value)

                comparison = ComparisonResult(
                    parameter_name=old_val.name,
                    old_value=old_val.value,
                    new_value=new_val.value,
                    change=round(change, 2),
                    change_percentage=round(change_percentage, 2),
                    trend=trend,
                    unit=new_val.unit
                )

            comparison_results.append(comparison)

        return comparison_results

    def _determine_trend(self, parameter_name: str, change: float, old_value: float = None) -> str:
        """
        Determine if change is improvement or worsening
        Args:
            parameter_name: Name of medical parameter
            change: Change in value
            old_value: Original value for percentage calculation
        Returns:
            Trend status: improved, worsened, stable
        """
        # Parameters where increase is bad
        increase_bad = [
            'glucose', 'cholesterol', 'ldl', 'triglycerides',
            'creatinine', 'urea', 'blood pressure', 'weight'
        ]

        # Parameters where decrease is bad
        decrease_bad = [
            'hemoglobin', 'hb', 'hdl', 'platelet', 'rbc',
            'oxygen saturation', 'spo2'
        ]

        # Check if change is significant
        # Use percentage change if old_value provided, otherwise use absolute threshold
        if old_value and old_value != 0:
            change_percentage = abs(change / old_value * 100)
            if change_percentage < 2:  # Less than 2% change is stable
                return "stable"
        else:
            # Fallback to absolute change for very small values
            if abs(change) < 0.1:
                return "stable"

        param_lower = parameter_name.lower()

        # Determine trend
        if change > 0:  # Increase
            if any(param in param_lower for param in increase_bad):
                return "worsened"
            elif any(param in param_lower for param in decrease_bad):
                return "improved"
            else:
                return "increased"
        else:  # Decrease
            if any(param in param_lower for param in decrease_bad):
                return "worsened"
            elif any(param in param_lower for param in increase_bad):
                return "improved"
            else:
                return "decreased"

    def _categorize_parameter(self, parameter_name: str) -> str:
        """
        Categorize a parameter into a test category
        Args:
            parameter_name: Name of the parameter
        Returns:
            Category name
        """
        param_lower = parameter_name.lower()

        for category, keywords in self.test_categories.items():
            if category == 'Other Tests':
                continue
            for keyword in keywords:
                if keyword in param_lower:
                    return category

        return 'Other Tests'

    def generate_summary(self, comparisons: List[ComparisonResult]) -> dict:
        """
        Generate comprehensive summary with visualizations
        Args:
            comparisons: List of comparison results
        Returns:
            Enhanced summary dictionary with category breakdown and visualization data
        """
        if not comparisons:
            return {
                'total_parameters': 0,
                'improved': 0,
                'worsened': 0,
                'stable': 0,
                'changed': 0,
                'improvement_rate': 0,
                'health_score': 0,
                'overall_trend': 'no_data',
                'category_breakdown': {},
                'critical_changes': [],
                'insights': [],
                'visualization_data': {
                    'trend_distribution': {},
                    'category_scores': {},
                    'timeline_data': []
                }
            }

        # Basic counts
        improved = sum(1 for c in comparisons if c.trend == "improved")
        worsened = sum(1 for c in comparisons if c.trend == "worsened")
        stable = sum(1 for c in comparisons if c.trend == "stable")
        changed = sum(1 for c in comparisons if c.trend == "changed")
        increased = sum(1 for c in comparisons if c.trend == "increased")
        decreased = sum(1 for c in comparisons if c.trend == "decreased")

        total = len(comparisons)

        # Calculate health score (0-100)
        # Formula: (improved * 100 + stable * 50 - worsened * 100) / total
        health_score = max(0, min(100,
            ((improved * 100 + stable * 50 + changed * 25 - worsened * 100) / total)
            if total > 0 else 0
        ))

        # Determine overall trend
        if improved > worsened:
            overall_trend = "improving"
        elif worsened > improved:
            overall_trend = "declining"
        else:
            overall_trend = "stable"

        # Category-wise breakdown
        category_breakdown = {}
        for category in self.test_categories.keys():
            category_breakdown[category] = {
                'total': 0,
                'improved': 0,
                'worsened': 0,
                'stable': 0,
                'parameters': []
            }

        for comp in comparisons:
            category = self._categorize_parameter(comp.parameter_name)
            category_breakdown[category]['total'] += 1
            category_breakdown[category]['parameters'].append(comp.parameter_name)

            if comp.trend == "improved":
                category_breakdown[category]['improved'] += 1
            elif comp.trend == "worsened":
                category_breakdown[category]['worsened'] += 1
            elif comp.trend in ["stable", "changed"]:
                category_breakdown[category]['stable'] += 1

        # Remove empty categories
        category_breakdown = {k: v for k, v in category_breakdown.items() if v['total'] > 0}

        # Identify critical changes (>20% change or worsened trend)
        critical_changes = []
        for comp in comparisons:
            if comp.trend == "worsened" or (comp.change_percentage and abs(comp.change_percentage) > 20):
                critical_changes.append({
                    'parameter': comp.parameter_name,
                    'old_value': comp.old_value,
                    'new_value': comp.new_value,
                    'change': comp.change,
                    'change_percentage': comp.change_percentage,
                    'trend': comp.trend,
                    'unit': comp.unit,
                    'severity': 'high' if comp.trend == "worsened" else 'medium'
                })

        # Sort critical changes by severity
        critical_changes.sort(key=lambda x: (
            0 if x['severity'] == 'high' else 1,
            -(abs(x['change_percentage']) if x['change_percentage'] else 0)
        ))

        # Generate insights
        insights = self._generate_insights(
            improved, worsened, stable, category_breakdown, critical_changes
        )

        # Visualization data
        visualization_data = {
            'trend_distribution': {
                'improved': improved,
                'worsened': worsened,
                'stable': stable,
                'changed': changed,
                'increased': increased,
                'decreased': decreased
            },
            'category_scores': {
                category: {
                    'score': round(
                        ((data['improved'] * 100 + data['stable'] * 50 - data['worsened'] * 100) / data['total'])
                        if data['total'] > 0 else 50, 1
                    ),
                    'improved': data['improved'],
                    'worsened': data['worsened'],
                    'stable': data['stable'],
                    'total': data['total']
                }
                for category, data in category_breakdown.items()
            },
            'timeline_data': [
                {
                    'parameter': comp.parameter_name,
                    'old_value': comp.old_value,
                    'new_value': comp.new_value,
                    'trend': comp.trend,
                    'category': self._categorize_parameter(comp.parameter_name)
                }
                for comp in comparisons
            ]
        }

        summary = {
            'total_parameters': total,
            'improved': improved,
            'worsened': worsened,
            'stable': stable,
            'changed': changed,
            'improvement_rate': round(improved / total * 100, 1) if total > 0 else 0,
            'health_score': round(health_score, 1),
            'overall_trend': overall_trend,
            'category_breakdown': category_breakdown,
            'critical_changes': critical_changes[:10],  # Top 10 critical changes
            'insights': insights,
            'visualization_data': visualization_data
        }

        return summary

    def _generate_insights(self, improved: int, worsened: int, stable: int,
                          category_breakdown: Dict, critical_changes: List) -> List[str]:
        """
        Generate health insights based on comparison data
        Args:
            improved: Number of improved parameters
            worsened: Number of worsened parameters
            stable: Number of stable parameters
            category_breakdown: Category-wise breakdown
            critical_changes: List of critical changes
        Returns:
            List of insight strings
        """
        insights = []

        # Overall health insight
        total = improved + worsened + stable
        if total == 0:
            return ["No comparable parameters found between reports."]

        improvement_rate = (improved / total) * 100
        worsening_rate = (worsened / total) * 100

        if improvement_rate > 60:
            insights.append(f"Excellent progress! {improved} out of {total} parameters have improved.")
        elif improvement_rate > 40:
            insights.append(f"Good progress! {improved} parameters are showing improvement.")
        elif worsening_rate > 40:
            insights.append(f"⚠ Attention needed: {worsened} parameters have worsened since last report.")
        else:
            insights.append(f"Health status is relatively stable with {stable} parameters unchanged.")

        # Category-specific insights
        for category, data in category_breakdown.items():
            if data['worsened'] > data['improved'] and data['worsened'] > 0:
                insights.append(
                    f"⚠ {category}: {data['worsened']} parameter(s) declined. Consider consulting your doctor."
                )
            elif data['improved'] > data['worsened'] and data['improved'] > 1:
                insights.append(
                    f"✓ {category}: Showing positive changes with {data['improved']} parameter(s) improved."
                )

        # Critical changes insights
        if critical_changes:
            high_severity = [c for c in critical_changes if c['severity'] == 'high']
            if high_severity:
                insights.append(
                    f"⚠ {len(high_severity)} parameter(s) require immediate attention. Review critical changes below."
                )

        # Recommendations
        if worsened > improved:
            insights.append("Recommendation: Schedule a follow-up consultation with your healthcare provider.")
        elif improved > worsened:
            insights.append("Keep up the good work! Continue maintaining your current health regimen.")

        return insights


# Singleton instance
compare_service = CompareService()
