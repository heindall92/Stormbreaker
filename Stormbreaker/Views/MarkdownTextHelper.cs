using System;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;

namespace Stormbreaker.Views
{
    public static class MarkdownTextHelper
    {
        public static readonly DependencyProperty MarkdownProperty =
            DependencyProperty.RegisterAttached("Markdown", typeof(string), typeof(MarkdownTextHelper),
                new PropertyMetadata(string.Empty, OnMarkdownChanged));

        public static string GetMarkdown(DependencyObject obj) => (string)obj.GetValue(MarkdownProperty);
        public static void SetMarkdown(DependencyObject obj, string value) => obj.SetValue(MarkdownProperty, value);

        private static void OnMarkdownChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is TextBlock textBlock)
            {
                textBlock.Inlines.Clear();
                var text = e.NewValue as string;
                if (string.IsNullOrEmpty(text)) return;

                var lines = text.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);
                bool first = true;
                foreach (var line in lines)
                {
                    var trimmed = line.Trim();
                    if (trimmed.StartsWith("##"))
                    {
                        var headerText = trimmed.TrimStart('#').Trim();
                        var run = new Run(headerText)
                        {
                            FontWeight = FontWeights.Bold,
                            FontSize = textBlock.FontSize + 1.5,
                            Foreground = Brushes.White
                        };
                        if (!first)
                        {
                            textBlock.Inlines.Add(new LineBreak());
                        }
                        textBlock.Inlines.Add(run);
                        textBlock.Inlines.Add(new LineBreak());
                    }
                    else if (trimmed.StartsWith("-") || trimmed.StartsWith("*") || trimmed.StartsWith("•"))
                    {
                        textBlock.Inlines.Add(new Run(" • ") { Foreground = new SolidColorBrush(Color.FromRgb(0, 212, 255)), FontWeight = FontWeights.Bold });
                        ParseInlineMarkdown(textBlock, trimmed.Substring(1).Trim());
                        textBlock.Inlines.Add(new LineBreak());
                    }
                    else if (string.IsNullOrWhiteSpace(trimmed))
                    {
                        textBlock.Inlines.Add(new LineBreak());
                    }
                    else
                    {
                        ParseInlineMarkdown(textBlock, trimmed);
                        textBlock.Inlines.Add(new LineBreak());
                    }
                    first = false;
                }
            }
        }

        private static void ParseInlineMarkdown(TextBlock textBlock, string text)
        {
            // Regex splitting bold (e.g. **bold**) and inline code (e.g. `code`)
            var parts = Regex.Split(text, @"(\*\*.*?\*\*|`.*?`)");
            foreach (var part in parts)
            {
                if (part.StartsWith("**") && part.EndsWith("**") && part.Length > 4)
                {
                    var clean = part.Substring(2, part.Length - 4);
                    textBlock.Inlines.Add(new Run(clean) { FontWeight = FontWeights.Bold, Foreground = Brushes.White });
                }
                else if (part.StartsWith("`") && part.EndsWith("`") && part.Length > 2)
                {
                    var clean = part.Substring(1, part.Length - 2);
                    textBlock.Inlines.Add(new Run(" " + clean + " ")
                    {
                        FontFamily = new FontFamily("Consolas, Courier New"),
                        Background = new SolidColorBrush(Color.FromArgb(20, 0, 212, 255)),
                        Foreground = new SolidColorBrush(Color.FromRgb(0, 212, 255))
                    });
                }
                else
                {
                    textBlock.Inlines.Add(new Run(part));
                }
            }
        }
    }
}
